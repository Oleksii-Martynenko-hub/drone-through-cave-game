import { ChangeEvent, useState, FormEvent } from 'react';
import styled from 'styled-components';

import { NewSessionData } from 'src/types/common';

import Button from './button';

interface Props {
  onSubmit: (newSessionData: NewSessionData) => void;
}

const Form = styled.form`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  max-width: 320px;
  margin-bottom: 40px;
`;

const Input = styled.input`
  font-size: 18px;
  line-height: 24px;
  border: none;
  padding: 10px 18px 10px;
  border-radius: 6px;

  flex: 100%;
  margin-bottom: 10px;
`;

const InputRangeWrapper = styled.div`
  display: grid;
  grid-template: 40px 1fr / 1fr 32px;

  width: 100%;
  color: white;
  font-size: 26px;
  margin-bottom: 16px;

  input {
    grid-column: 1 / 3;
  }
`;

const PlayButton = styled(Button)`
  flex: 1 1 auto;
`;

function NewSessionForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(0);

  function onSubmitForm(e: FormEvent) {
    e.preventDefault();

    onSubmit({ name, difficulty });
    setName('');
    setDifficulty(0);
  }

  function onChangePlayerName(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function onChangeDifficulty(e: ChangeEvent<HTMLInputElement>) {
    setDifficulty(+e.target.value);
  }

  return (
    <Form onSubmit={onSubmitForm}>
      <Input
        type="text"
        name="name"
        id="name"
        placeholder="Player name"
        value={name}
        onChange={onChangePlayerName}
      />

      <InputRangeWrapper>
        <label htmlFor="difficulty">Difficulty level:</label>

        <span>{difficulty}</span>

        <input
          type="range"
          name="difficulty"
          id="difficulty"
          min={0}
          max={10}
          value={difficulty}
          placeholder="Diff"
          onChange={onChangeDifficulty}
        />
      </InputRangeWrapper>

      <PlayButton>Play</PlayButton>
    </Form>
  );
}

export default NewSessionForm;
