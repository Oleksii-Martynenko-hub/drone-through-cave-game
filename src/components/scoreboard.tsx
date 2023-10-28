import styled from 'styled-components';

import { GameSession } from 'src/types/common';

interface Props {
  scoreboardData: GameSession[];
}

const StyledScoreBoard = styled.table`
  border-collapse: collapse;
  text-indent: initial;
  border-spacing: 0px;
  overflow: hidden;
  background: whitesmoke;
  border-radius: 6px;

  th {
    background: #e4e4e4;
    padding: 12px 20px;
  }

  td {
    padding: 8px 20px;
  }

  th:not(:last-of-type),
  td:not(:last-of-type) {
    margin-right: -1px;
    border-right: 1px solid #aaa;
  }

  th,
  tr:not(:last-of-type) td {
    border-bottom: 1px solid #aaa;
  }
`;

const Scoreboard = ({ scoreboardData }: Props) => {
  return (
    <StyledScoreBoard>
      <thead>
        <tr>
          <th>Name</th>
          <th style={{ textAlign: 'center' }}>Difficulty</th>
          <th style={{ textAlign: 'end' }}>Score</th>
        </tr>
      </thead>

      <tbody>
        {scoreboardData
          .sort((a, b) => b.score - a.score)
          .map((session) => (
            <tr key={session.id}>
              <td>{session.name}</td>
              <td style={{ textAlign: 'center' }}>{session.difficulty}</td>
              <td style={{ textAlign: 'end' }}>{session.score}</td>
            </tr>
          ))}
      </tbody>
    </StyledScoreBoard>
  );
};

export default Scoreboard;
