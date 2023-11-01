import styled from 'styled-components';

import { GameSession } from 'src/types/common';

interface Props {
  scoreboardData: GameSession[];
}

const StyledScoreBoard = styled.div`
  max-height: calc(100% - 234px);
  overflow-y: auto;
  border-radius: 6px;
  margin-top: 40px;
`;

const ScoreTable = styled.table`
  position: relative;
  width: 100%;
  text-indent: initial;
  background: whitesmoke;
  border-collapse: separate;
  border-spacing: 0;

  th {
    position: sticky;
    top: 0;
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
      <ScoreTable>
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
      </ScoreTable>
    </StyledScoreBoard>
  );
};

export default Scoreboard;
