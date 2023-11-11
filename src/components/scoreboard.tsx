import { MouseEvent } from 'react';
import styled from 'styled-components';

import { GameSession } from 'src/types/common';

import { formatTime } from 'src/services/format-time';

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
    font-size: 20px;
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

  td.expand-btn {
    padding: 8px 14px;
    user-select: none;
    cursor: pointer;

    :hover {
      background: #e2e2e2;
    }
  }

  tr.details {
    display: none;
    background: #e5e5ee;
  }

  tr:has(td.expanded) + tr.details {
    display: table-row;
  }
`;

const Scoreboard = ({ scoreboardData }: Props) => {
  const onClickExpandHandler = (e: MouseEvent) => {
    e.currentTarget.classList.toggle('expanded');
  };

  return (
    <StyledScoreBoard>
      <ScoreTable>
        <thead>
          <tr>
            <th>Name</th>
            <th colSpan={1} style={{ textAlign: 'end' }}>
              Score
            </th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>

        <tbody>
          {scoreboardData
            .sort((a, b) => b.score - a.score)
            .map(({ id, name, difficulty, score, ...rest }) => (
              <>
                <tr key={id}>
                  <td>{name}</td>
                  <td style={{ textAlign: 'end' }}>{score}</td>
                  <td
                    className="expand-btn"
                    onClick={onClickExpandHandler}
                    aria-label="expand-details-btn"
                  >
                    ...
                  </td>
                </tr>
                <tr key={id + '-details'} className="details">
                  <td colSpan={3}>
                    <span>
                      level: {difficulty}
                      {rest.distance !== undefined &&
                        ` / ${rest.distance.toFixed(2)}m`}
                      {rest.time !== undefined && ` / ${formatTime(rest.time)}`}
                    </span>
                  </td>
                </tr>
              </>
            ))}
        </tbody>
      </ScoreTable>
    </StyledScoreBoard>
  );
};

export default Scoreboard;
