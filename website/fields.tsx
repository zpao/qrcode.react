import type {ChangeEvent} from 'react';
import React, {useId} from 'react';
import {Field} from '@astryxdesign/core/Field';

type ColorFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly isDisabled?: boolean;
};

function ColorField(props: ColorFieldProps) {
  const inputID = useId();
  return (
    <Field label={props.label} inputID={inputID} isDisabled={props.isDisabled}>
      <input
        id={inputID}
        type="color"
        value={props.value}
        disabled={props.isDisabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          props.onChange(e.target.value);
        }}
      />
    </Field>
  );
}

export {ColorField};
