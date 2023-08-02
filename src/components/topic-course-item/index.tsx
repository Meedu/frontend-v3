import React from "react";
import styles from "./index.module.scss";
import { ThumbBar } from "../thumb-bar";
import { useNavigate } from "react-router-dom";

interface PropInterface {
  cid: number;
  title: string;
  thumb: string;
  charge: number;
  category: any;
  viewTimes: number;
  isVipFree: boolean;
  isNeedLogin: boolean;
  voteCount: number;
  commentCount: number;
}

export const TopicCourseItem: React.FC<PropInterface> = ({
  cid,
  title,
  thumb,
  charge,
  category,
  viewTimes,
  isVipFree,
  isNeedLogin,
  voteCount,
  commentCount,
}) => {
  const navigate = useNavigate();
  const goDetail = () => {
    navigate("/topic/detail/" + cid);
  };

  return (
    <div className={styles["topic-item-comp"]} onClick={() => goDetail()}>
      <div className={styles["topic-thumb"]}>
        <div className={styles["thumb-bar"]}>
          <ThumbBar value={thumb} width={133} height={100} border={null} />
        </div>
      </div>
      <div className={styles["topic-body"]}>
        <div className={styles["topic-title"]}>{title}</div>
        <div className={styles["topic-info"]}>
          <div className={styles["category"]}>{category}</div>
          <span className={styles["read-count"]}>{viewTimes}次阅读</span>
        </div>
      </div>
    </div>
  );
};
