import { ChangeEvent, useState, FormEvent } from 'react';
import styled from 'styled-components';

import { WithoutNull } from 'src/types/common';

import { GameSessionType } from 'src/store/gameSessionSlice/gameSession.slice';

import Button from './common/button';

interface Props {
  initData: GameSessionType;
  onSubmit: (newSessionData: WithoutNull<GameSessionType>) => void;
}

const Form = styled.form`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  max-width: 320px;
  margin: 0 auto;
`;

const Input = styled.input`
  font-size: 18px;
  line-height: 24px;
  border: none;
  padding: 10px 18px 10px;
  border-radius: 6px;

  flex: 100%;
  margin: 10px 0 20px 0;
`;

const InputRangeWrapper = styled.div`
  display: grid;
  grid-template: 40px 1fr / 1fr 32px;

  width: 100%;
  color: white;
  font-size: 26px;
  margin-bottom: 20px;

  input {
    grid-column: 1 / 3;
  }
`;

const PlayButton = styled(Button)`
  flex: 1 1 auto;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  line-height: 16px;
  margin: -14px 0 -8px 0;
  color: #dd5c5c;
`;

function NewSessionForm({ initData, onSubmit }: Props) {
  const [name, setName] = useState(initData.name || '');
  const [difficulty, setDifficulty] = useState(initData.complexity || 0);

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  function onSubmitForm(e: FormEvent) {
    e.preventDefault();
    if (!name) {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Please choose the player's name!",
      }));

      return;
    }

    onSubmit({ name, complexity: difficulty });
    setName('');
    setDifficulty(0);
  }

  function onChangePlayerName(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);

    if (!e.target.value) {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Please choose the player's name!",
      }));
      return;
    }

    setValidationErrors((prev) => ({ ...prev, name: '' }));
  }

  function onChangeDifficulty(e: ChangeEvent<HTMLInputElement>) {
    setDifficulty(+e.target.value);
  }

  return (
    <Form onSubmit={onSubmitForm}>
      {!!validationErrors['name'] && (
        <ErrorMessage>{validationErrors['name']}</ErrorMessage>
      )}
      <Input
        type="text"
        name="name"
        id="name"
        placeholder="Player name"
        value={name}
        onChange={onChangePlayerName}
        autoFocus
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
