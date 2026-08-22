import {QRCodeSVG} from 'qrcode.react';
import React, {useState} from 'react';
import type {ReactNode} from 'react';

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

function Field(props: {label: string; children: ReactNode}) {
  return (
    <div>
      <label>
        {props.label}
        <br />
        {props.children}
      </label>
    </div>
  );
}

function PayloadOutput(props: {payload: string; children: ReactNode}) {
  const snippet = `import {QRCodeSVG} from 'qrcode.react';
<QRCodeSVG
  value={${JSON.stringify(props.payload)}}
  size={192}
  marginSize={4}
/>`;
  const bytes = new TextEncoder().encode(props.payload).length;
  const payloadRows = Math.max(4, props.payload.split(/\r\n|\n/).length);
  return (
    <div className="container">
      <div className="form">{props.children}</div>
      <div className="output">
        <div>
          <label>
            Payload:
            <br />
            <textarea
              rows={payloadRows}
              cols={80}
              readOnly={true}
              value={props.payload}
            />
          </label>
        </div>
        <p>{bytes} bytes</p>
        <QRCodeSVG value={props.payload} size={192} marginSize={4} />
        <div>
          <label>
            React:
            <br />
            <textarea
              rows={snippet.split('\n').length}
              cols={80}
              readOnly={true}
              value={snippet}
            />
          </label>
        </div>
      </div>
    </div>
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
    <PayloadOutput payload={encodeWifi(fields)}>
      <Field label="Network name (SSID):">
        <input
          type="text"
          value={fields.ssid}
          onChange={(e) => setFields({...fields, ssid: e.target.value})}
        />
      </Field>
      <Field label="Security:">
        <select
          value={fields.security}
          onChange={(e) =>
            setFields({
              ...fields,
              security: e.target.value as WifiFields['security'],
            })
          }>
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None</option>
        </select>
      </Field>
      {fields.security !== 'nopass' ? (
        <Field label="Password:">
          <input
            type="text"
            value={fields.password ?? ''}
            onChange={(e) => setFields({...fields, password: e.target.value})}
          />
        </Field>
      ) : null}
      <Field label="Hidden network:">
        <input
          type="checkbox"
          checked={fields.hidden}
          onChange={(e) => setFields({...fields, hidden: e.target.checked})}
        />
      </Field>
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
    <PayloadOutput payload={encodeContact(fields)}>
      <Field label="Format:">
        <select
          value={fields.format}
          onChange={(e) =>
            setFields({
              ...fields,
              format: e.target.value as ContactFields['format'],
            })
          }>
          <option value="vcard">vCard</option>
          <option value="mecard">MECARD</option>
        </select>
      </Field>
      <Field label="First name:">
        <input
          type="text"
          value={fields.first}
          onChange={(e) => setFields({...fields, first: e.target.value})}
        />
      </Field>
      <Field label="Last name:">
        <input
          type="text"
          value={fields.last}
          onChange={(e) => setFields({...fields, last: e.target.value})}
        />
      </Field>
      <Field label="Organization:">
        <input
          type="text"
          value={fields.org}
          onChange={(e) => setFields({...fields, org: e.target.value})}
        />
      </Field>
      <Field label="Title:">
        <input
          type="text"
          value={fields.title}
          onChange={(e) => setFields({...fields, title: e.target.value})}
        />
      </Field>
      <Field label="Phone:">
        <input
          type="tel"
          value={fields.phone}
          onChange={(e) => setFields({...fields, phone: e.target.value})}
        />
      </Field>
      <Field label="Email:">
        <input
          type="email"
          value={fields.email}
          onChange={(e) => setFields({...fields, email: e.target.value})}
        />
      </Field>
      <Field label="URL:">
        <input
          type="url"
          value={fields.url}
          onChange={(e) => setFields({...fields, url: e.target.value})}
        />
      </Field>
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
    <PayloadOutput payload={encodeEvent(fields)}>
      <Field label="Summary:">
        <input
          type="text"
          value={fields.summary}
          onChange={(e) => setFields({...fields, summary: e.target.value})}
        />
      </Field>
      <Field label="Location:">
        <input
          type="text"
          value={fields.location}
          onChange={(e) => setFields({...fields, location: e.target.value})}
        />
      </Field>
      <Field label="Start (UTC, e.g. 20260821T180000Z):">
        <input
          type="text"
          value={fields.start}
          onChange={(e) => setFields({...fields, start: e.target.value})}
        />
      </Field>
      <Field label="All day:">
        <input
          type="checkbox"
          checked={Boolean(fields.allDay)}
          onChange={(e) => setFields({...fields, allDay: e.target.checked})}
        />
      </Field>
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
    <PayloadOutput payload={encodeEmail(fields)}>
      <Field label="To:">
        <input
          type="email"
          value={fields.to}
          onChange={(e) => setFields({...fields, to: e.target.value})}
        />
      </Field>
      <Field label="Subject:">
        <input
          type="text"
          value={fields.subject}
          onChange={(e) => setFields({...fields, subject: e.target.value})}
        />
      </Field>
      <Field label="Body:">
        <textarea
          rows={4}
          cols={40}
          value={fields.body}
          onChange={(e) => setFields({...fields, body: e.target.value})}
        />
      </Field>
    </PayloadOutput>
  );
}

function SmsCard() {
  const [fields, setFields] = useState<SmsFields>({
    number: '+15550101234',
    body: 'Meet me at 10',
  });
  return (
    <PayloadOutput payload={encodeSms(fields)}>
      <Field label="Number:">
        <input
          type="tel"
          value={fields.number}
          onChange={(e) => setFields({...fields, number: e.target.value})}
        />
      </Field>
      <Field label="Body:">
        <textarea
          rows={4}
          cols={40}
          value={fields.body}
          onChange={(e) => setFields({...fields, body: e.target.value})}
        />
      </Field>
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
    <PayloadOutput payload={encodeTotp(fields)}>
      <Field label="Issuer:">
        <input
          type="text"
          value={fields.issuer}
          onChange={(e) => setFields({...fields, issuer: e.target.value})}
        />
      </Field>
      <Field label="Account:">
        <input
          type="text"
          value={fields.account}
          onChange={(e) => setFields({...fields, account: e.target.value})}
        />
      </Field>
      <Field label="Secret (Base32):">
        <input
          type="text"
          value={fields.secret}
          onChange={(e) => setFields({...fields, secret: e.target.value})}
        />
      </Field>
      {secretLooksValid ? null : (
        <p>
          Secret should be Base32 (A-Z and 2-7). The encoder still uses it as
          typed.
        </p>
      )}
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
    <PayloadOutput payload={payload}>
      <Field label="Latitude:">
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </Field>
      <Field label="Longitude:">
        <input
          type="text"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />
      </Field>
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
    <>
      {PAYLOADS.map((payload) => (
        <section key={payload.id} id={payload.id}>
          <h2>{payload.label}</h2>
          <p>{payload.summary}</p>
          <p>{payload.support}</p>
          <payload.Card />
        </section>
      ))}
    </>
  );
}

export {PayloadsDemo};
