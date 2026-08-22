import {QRCodeSVG} from 'qrcode.react';
import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Section} from '@astryxdesign/core/Section';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {DemoPage, QrPreview} from './demo-tool';

type FieldEntry = readonly [
  key: string,
  value: string | boolean | readonly string[] | undefined,
];

function escapeKeyValue(value: string): string {
  return value.replace(/[\\;,:"]/g, (ch) => `\\${ch}`);
}

function isOmitted(
  value: string | boolean | readonly string[] | undefined
): boolean {
  if (value === undefined || value === '') {
    return true;
  }
  return Array.isArray(value) && value.every((part) => part === '');
}

function formatKeyValue(value: string | boolean | readonly string[]): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string') {
    return escapeKeyValue(value);
  }
  return value.map(escapeKeyValue).join(',');
}

function keyValuePayload(
  prefix: string,
  entries: readonly FieldEntry[]
): string {
  const parts: string[] = [];
  for (const [key, value] of entries) {
    if (value === undefined || isOmitted(value)) {
      continue;
    }
    parts.push(`${key}:${formatKeyValue(value)}`);
  }
  return `${prefix}:${parts.join(';')};;`;
}

type UriParts = {
  scheme: string;
  authority?: string;
  path: string;
  params?: Readonly<Record<string, string | number | undefined>>;
};

function encodeQuery(
  params: Readonly<Record<string, string | number | undefined>> | undefined
): string {
  if (params == null) {
    return '';
  }
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue;
    }
    // encodeURIComponent keeps spaces as %20; URLSearchParams emits +.
    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );
  }
  return parts.join('&');
}

function uriPayload({scheme, authority, path, params}: UriParts): string {
  let out = `${scheme}:`;
  if (authority != null && authority !== '') {
    out += `//${authority}`;
    if (path !== '' && path.charAt(0) !== '/') {
      out += '/';
    }
  }
  out += path;
  const query = encodeQuery(params);
  if (query !== '') {
    out += `?${query}`;
  }
  return out;
}

function escapeRecordValue(value: string): string {
  return value.replace(/[\\;,]/g, (ch) => `\\${ch}`);
}

function recordProperty(
  name: string,
  value: string | number | readonly string[] | undefined,
  params?: Readonly<Record<string, string>>
): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  let escaped: string;
  if (typeof value === 'string' || typeof value === 'number') {
    escaped = escapeRecordValue(String(value));
  } else {
    if (value.every((part) => part === '')) {
      return undefined;
    }
    escaped = value.map(escapeRecordValue).join(';');
  }
  let head = name;
  if (params != null) {
    for (const [key, paramValue] of Object.entries(params)) {
      head += `;${key}=${paramValue}`;
    }
  }
  return `${head}:${escaped}`;
}

function recordPayload(
  name: string,
  bodyLines: readonly (string | undefined)[]
): string {
  const lines = bodyLines.filter(
    (line): line is string => line != null && line !== ''
  );
  return [`BEGIN:${name}`, ...lines, `END:${name}`].join('\r\n');
}

type WifiFields = {
  ssid: string;
  password?: string;
  security: 'nopass' | 'WPA' | 'WEP';
  hidden: boolean;
};

function encodeWifi(fields: WifiFields): string {
  return keyValuePayload('WIFI', [
    ['T', fields.security],
    ['S', fields.ssid],
    ['P', fields.security === 'nopass' ? undefined : fields.password],
    ['H', fields.hidden],
  ]);
}

type ContactFields = {
  format: 'vcard' | 'mecard';
  first: string;
  last: string;
  org: string;
  title: string;
  phone: string;
  email: string;
  url: string;
};

function encodeVcard(fields: ContactFields): string {
  return recordPayload('VCARD', [
    recordProperty('VERSION', '3.0'),
    recordProperty('N', [fields.last, fields.first, '', '', '']),
    recordProperty('FN', `${fields.first} ${fields.last}`.trim()),
    recordProperty('ORG', fields.org),
    recordProperty('TITLE', fields.title),
    recordProperty('TEL', fields.phone),
    recordProperty('EMAIL', fields.email),
    recordProperty('URL', fields.url),
  ]);
}

function encodeMecard(fields: ContactFields): string {
  return keyValuePayload('MECARD', [
    ['N', [fields.last, fields.first]],
    ['ORG', fields.org],
    ['NOTE', fields.title],
    ['TEL', fields.phone],
    ['EMAIL', fields.email],
    ['URL', fields.url],
  ]);
}

function encodeContact(fields: ContactFields): string {
  return fields.format === 'mecard'
    ? encodeMecard(fields)
    : encodeVcard(fields);
}

type EventFields = {
  summary: string;
  location: string;
  start: string;
  allDay?: boolean;
};

function eventUid(fields: EventFields): string {
  return [
    fields.summary,
    fields.location,
    fields.start,
    fields.allDay ? 'allday' : 'timed',
    'qrcode.react',
  ].join('/');
}

function icalDate(start: string): string {
  return start.length >= 8 ? start.slice(0, 8) : start;
}

function encodeEvent(fields: EventFields): string {
  const startLine = fields.allDay
    ? recordProperty('DTSTART', icalDate(fields.start), {VALUE: 'DATE'})
    : recordProperty('DTSTART', fields.start);
  return recordPayload('VCALENDAR', [
    recordProperty('VERSION', '2.0'),
    recordProperty('PRODID', '-//qrcode.react//demo//EN'),
    recordPayload('VEVENT', [
      recordProperty('UID', eventUid(fields)),
      recordProperty('DTSTAMP', fields.start),
      startLine,
      recordProperty('SUMMARY', fields.summary),
      recordProperty('LOCATION', fields.location),
    ]),
  ]);
}

type EmailFields = {
  to: string;
  subject: string;
  body: string;
};

function encodeEmail(fields: EmailFields): string {
  return uriPayload({
    scheme: 'mailto',
    path: fields.to,
    params: {
      subject: fields.subject,
      body: fields.body,
    },
  });
}

type SmsFields = {
  number: string;
  body: string;
};

function encodeSms(fields: SmsFields): string {
  return uriPayload({
    scheme: 'sms',
    path: fields.number,
    params: {body: fields.body},
  });
}

type TotpFields = {
  issuer: string;
  account: string;
  secret: string;
};

function encodeTotp(fields: TotpFields): string {
  const path =
    fields.issuer !== ''
      ? `${encodeURIComponent(fields.issuer)}:${encodeURIComponent(fields.account)}`
      : encodeURIComponent(fields.account);
  return uriPayload({
    scheme: 'otpauth',
    authority: 'totp',
    path,
    params: {
      secret: fields.secret,
      issuer: fields.issuer,
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    },
  });
}

type GeoFields = {
  lat: number;
  lon: number;
};

function encodeGeo(fields: GeoFields): string {
  return uriPayload({
    scheme: 'geo',
    path: `${fields.lat},${fields.lon}`,
  });
}

type PayloadExample = {
  id: string;
  label: string;
  summary: string;
  support: string;
  Card: () => React.ReactElement;
};

function makePayloadSnippet(payload: string): string {
  return `import {QRCodeSVG} from 'qrcode.react';
<QRCodeSVG
  value={${JSON.stringify(payload)}}
  size={192}
  marginSize={4}
/>`;
}

function PayloadOutput(props: {
  title: string;
  description: string;
  payload: string;
  children: ReactNode;
}) {
  const snippet = makePayloadSnippet(props.payload);
  const bytes = new TextEncoder().encode(props.payload).length;
  const payloadRows = Math.max(4, props.payload.split(/\r\n|\n/).length);
  return (
    <Section padding={0}>
      <VStack gap={3}>
        <Heading level={2}>{props.title}</Heading>
        <Text display="block" color="secondary">
          {props.description}
        </Text>
        <HStack wrap="wrap" gap={6} vAlign="start">
          <VStack width={380}>
            <FormLayout>{props.children}</FormLayout>
          </VStack>
          <VStack gap={3}>
            <QrPreview title={`${props.title} QR code`} code={snippet}>
              <QRCodeSVG value={props.payload} size={192} marginSize={4} />
            </QrPreview>
            <TextArea
              label="Payload"
              value={props.payload}
              rows={payloadRows}
              isReadOnly
            />
            <Text display="block">{bytes} bytes</Text>
          </VStack>
        </HStack>
      </VStack>
    </Section>
  );
}

function WifiCard() {
  const [fields, setFields] = useState<WifiFields>({
    ssid: 'Example Network',
    password: 'correct;horse',
    security: 'WPA',
    hidden: false,
  });
  return (
    <PayloadOutput
      title="Wi-Fi"
      description="Joins a network without typing the password. Camera on recent iOS and Android Wi-Fi settings often offer to join. WPA3-only networks may need T:SAE, which older scanners ignore."
      payload={encodeWifi(fields)}>
      <TextInput
        label="Network name (SSID)"
        value={fields.ssid}
        onChange={(ssid) => setFields({...fields, ssid})}
      />
      <Selector
        label="Security"
        value={fields.security}
        options={[
          {value: 'WPA', label: 'WPA/WPA2'},
          {value: 'WEP', label: 'WEP'},
          {value: 'nopass', label: 'None'},
        ]}
        onChange={(security) =>
          setFields({
            ...fields,
            security: security as WifiFields['security'],
          })
        }
      />
      {fields.security !== 'nopass' ? (
        <TextInput
          label="Password"
          value={fields.password ?? ''}
          onChange={(password) => setFields({...fields, password})}
        />
      ) : null}
      <Switch
        label="Hidden network"
        value={fields.hidden}
        onChange={(hidden) => setFields({...fields, hidden})}
      />
    </PayloadOutput>
  );
}

function ContactCard() {
  const [fields, setFields] = useState<ContactFields>({
    format: 'vcard',
    first: 'Ada',
    last: 'Example',
    org: 'Example Co',
    title: 'Engineer',
    phone: '+15550101234',
    email: 'ada@example.com',
    url: 'https://example.com',
  });
  return (
    <PayloadOutput
      title="Contact"
      description="Offers a vCard or MECARD the scanner can import. vCard 3.0 usually imports. MECARD is shorter and some scanners skip fields."
      payload={encodeContact(fields)}>
      <Selector
        label="Format"
        value={fields.format}
        options={[
          {value: 'vcard', label: 'vCard'},
          {value: 'mecard', label: 'MECARD'},
        ]}
        onChange={(format) =>
          setFields({
            ...fields,
            format: format as ContactFields['format'],
          })
        }
      />
      <TextInput
        label="First name"
        value={fields.first}
        onChange={(first) => setFields({...fields, first})}
      />
      <TextInput
        label="Last name"
        value={fields.last}
        onChange={(last) => setFields({...fields, last})}
      />
      <TextInput
        label="Organization"
        value={fields.org}
        onChange={(org) => setFields({...fields, org})}
      />
      <TextInput
        label="Title"
        value={fields.title}
        onChange={(title) => setFields({...fields, title})}
      />
      <TextInput
        label="Phone"
        value={fields.phone}
        onChange={(phone) => setFields({...fields, phone})}
      />
      <TextInput
        label="Email"
        type="email"
        value={fields.email}
        onChange={(email) => setFields({...fields, email})}
      />
      <TextInput
        label="URL"
        value={fields.url}
        onChange={(url) => setFields({...fields, url})}
      />
    </PayloadOutput>
  );
}

function EventCard() {
  const [fields, setFields] = useState<EventFields>({
    summary: 'Office offsite',
    location: 'Example Cafe, 1 Example Way',
    start: '20260821T180000Z',
    allDay: false,
  });
  return (
    <PayloadOutput
      title="Calendar event"
      description="Offers an iCalendar event the scanner can add. Calendar apps that understand iCalendar often offer to add the event. Time zone handling varies."
      payload={encodeEvent(fields)}>
      <TextInput
        label="Summary"
        value={fields.summary}
        onChange={(summary) => setFields({...fields, summary})}
      />
      <TextInput
        label="Location"
        value={fields.location}
        onChange={(location) => setFields({...fields, location})}
      />
      <TextInput
        label="Start (UTC, e.g. 20260821T180000Z)"
        value={fields.start}
        onChange={(start) => setFields({...fields, start})}
      />
      <Switch
        label="All day"
        value={Boolean(fields.allDay)}
        onChange={(allDay) => setFields({...fields, allDay})}
      />
    </PayloadOutput>
  );
}

function EmailCard() {
  const [fields, setFields] = useState<EmailFields>({
    to: 'ada@example.com',
    subject: 'Hello from a QR code',
    body: 'Meet me at 10',
  });
  return (
    <PayloadOutput
      title="Email"
      description="Opens a mailto draft with subject and body filled in. Scanners that handle mailto: typically open a draft. They do not send mail on their own."
      payload={encodeEmail(fields)}>
      <TextInput
        label="To"
        type="email"
        value={fields.to}
        onChange={(to) => setFields({...fields, to})}
      />
      <TextInput
        label="Subject"
        value={fields.subject}
        onChange={(subject) => setFields({...fields, subject})}
      />
      <TextArea
        label="Body"
        value={fields.body}
        onChange={(body) => setFields({...fields, body})}
        rows={4}
      />
    </PayloadOutput>
  );
}

function SmsCard() {
  const [fields, setFields] = useState<SmsFields>({
    number: '+15550101234',
    body: 'Meet me at 10',
  });
  return (
    <PayloadOutput
      title="SMS"
      description="Opens a text message draft. Uses sms: with ?body=. Some iOS versions expect sms:number&body= instead."
      payload={encodeSms(fields)}>
      <TextInput
        label="Number"
        value={fields.number}
        onChange={(number) => setFields({...fields, number})}
      />
      <TextArea
        label="Body"
        value={fields.body}
        onChange={(body) => setFields({...fields, body})}
        rows={4}
      />
    </PayloadOutput>
  );
}

const BASE32_SECRET = /^[A-Z2-7]+=*$/i;

function TotpCard() {
  const [fields, setFields] = useState<TotpFields>({
    issuer: 'Example',
    account: 'ada@example.com',
    secret: 'JBSWY3DPEHPK3PXP',
  });
  const secretLooksValid = BASE32_SECRET.test(fields.secret);
  return (
    <PayloadOutput
      title="Authenticator (TOTP)"
      description="Adds a one-time-password account to an authenticator app. Apps that implement otpauth URIs typically add the account. Digits, period, and algorithm are 6 / 30 / SHA1."
      payload={encodeTotp(fields)}>
      <TextInput
        label="Issuer"
        value={fields.issuer}
        onChange={(issuer) => setFields({...fields, issuer})}
      />
      <TextInput
        label="Account"
        value={fields.account}
        onChange={(account) => setFields({...fields, account})}
      />
      <TextInput
        label="Secret (Base32)"
        value={fields.secret}
        onChange={(secret) => setFields({...fields, secret})}
        status={
          secretLooksValid
            ? undefined
            : {
                type: 'warning',
                message:
                  'Secret should be Base32 (A-Z and 2-7). The encoder still uses it as typed.',
              }
        }
      />
    </PayloadOutput>
  );
}

function GeoCard() {
  const [lat, setLat] = useState('37.7749');
  const [lon, setLon] = useState('-122.4194');
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const payload =
    Number.isFinite(latNum) && Number.isFinite(lonNum)
      ? encodeGeo({lat: latNum, lon: lonNum})
      : '';
  return (
    <PayloadOutput
      title="Location"
      description="Opens a maps app at the coordinates. Scanners that handle geo: typically open a maps app at the coordinates."
      payload={payload}>
      <TextInput label="Latitude" value={lat} onChange={setLat} />
      <TextInput label="Longitude" value={lon} onChange={setLon} />
    </PayloadOutput>
  );
}

const PAYLOADS: readonly PayloadExample[] = [
  {
    id: 'wifi',
    label: 'Wi-Fi',
    summary: 'Joins a network without typing the password.',
    support:
      'Camera on recent iOS and Android Wi-Fi settings often offer to join. WPA3-only networks may need T:SAE, which older scanners ignore.',
    Card: WifiCard,
  },
  {
    id: 'contact',
    label: 'Contact',
    summary: 'Offers a vCard or MECARD the scanner can import.',
    support:
      'vCard 3.0 usually imports. MECARD is shorter and some scanners skip fields.',
    Card: ContactCard,
  },
  {
    id: 'event',
    label: 'Calendar event',
    summary: 'Offers an iCalendar event the scanner can add.',
    support:
      'Calendar apps that understand iCalendar often offer to add the event. Time zone handling varies.',
    Card: EventCard,
  },
  {
    id: 'email',
    label: 'Email',
    summary: 'Opens a mailto draft with subject and body filled in.',
    support:
      'Scanners that handle mailto: typically open a draft. They do not send mail on their own.',
    Card: EmailCard,
  },
  {
    id: 'sms',
    label: 'SMS',
    summary: 'Opens a text message draft.',
    support:
      'Uses sms: with ?body=. Some iOS versions expect sms:number&body= instead.',
    Card: SmsCard,
  },
  {
    id: 'totp',
    label: 'Authenticator (TOTP)',
    summary: 'Adds a one-time-password account to an authenticator app.',
    support:
      'Apps that implement otpauth URIs typically add the account. Digits, period, and algorithm are 6 / 30 / SHA1.',
    Card: TotpCard,
  },
  {
    id: 'geo',
    label: 'Location',
    summary: 'Opens a maps app at the coordinates.',
    support:
      'Scanners that handle geo: typically open a maps app at the coordinates.',
    Card: GeoCard,
  },
];

function PayloadsDemo() {
  return (
    <DemoPage
      title="Payloads"
      description="Real-world QR contents: Wi-Fi, contact, calendar, SMS, email, TOTP, geo.">
      {PAYLOADS.map((payload) => {
        const Card = payload.Card;
        return <Card key={payload.id} />;
      })}
    </DemoPage>
  );
}

export {PayloadsDemo};
