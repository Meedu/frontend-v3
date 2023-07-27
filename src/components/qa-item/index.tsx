import React from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import icon from "../../assets/img/commen/icon-question.png";

interface PropInterface {
  cid: number;
  title: string;
  credit1: number;
  statusText: string;
  status: number;
  viewTimes: number;
  answerCount: number;
  voteCount: number;
}
export const QaItem: React.FC<PropInterface> = ({
  cid,
  title,
  credit1,
  statusText,
  status,
  viewTimes,
  answerCount,
  voteCount,
}) => {
  const navigate = useNavigate();

  const goDetail = () => {
    navigate("/wenda/detail/" + cid);
  };

  return (
    <div className={styles["qa-item-comp"]} onClick={() => goDetail()}>
      <div className={styles["icon"]}>
        <img src={icon} />
      </div>
      {status === 1 && (
        <div className={styles["status-label"]}>{statusText}</div>
      )}
      <div className={styles["body"]}>
        <div className={styles["title"]}>{title}</div>
        <div className={styles["stat"]}>
          <span className={styles["answer-count"]}>{answerCount}个回答</span>
          <span className={styles["view-times"]}>{viewTimes}次浏览</span>
          {credit1 > 0 && (
            <span className={styles["credit1-label"]}>{credit1}积分</span>
          )}
        </div>
      </div>
    </div>
  );
};
