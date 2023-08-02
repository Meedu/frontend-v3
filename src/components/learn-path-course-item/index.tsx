import React from "react";
import styles from "./index.module.scss";
import { ThumbBar } from "../thumb-bar";
import { useNavigate } from "react-router-dom";

interface PropInterface {
  cid: number;
  name: string;
  thumb: string;
  desc: string;
  charge: number;
  originalCharge: number;
  coursesCount: number;
  stepsCount: number;
}
export const LearnPathCourseItem: React.FC<PropInterface> = ({
  cid,
  name,
  thumb,
  charge,
  originalCharge,
  coursesCount,
  stepsCount,
}) => {
  const navigate = useNavigate();

  const goDetail = () => {
    navigate("/learnPath/detail/" + cid);
  };

  return (
    <div className={styles["learnPath-item-comp"]} onClick={() => goDetail()}>
      <div className={styles["learnPath-thumb"]}>
        <div className={styles["thumb-bar"]}>
          <ThumbBar value={thumb} width={264} height={198} border={null} />
        </div>
      </div>
      <div className={styles["learnPath-body"]}>
        <div className={styles["learnPath-title"]}>{name}</div>
        <div className={styles["learnPath-count"]}>
          <div className={styles["courses-count"]}>
            包含{coursesCount}门课程
          </div>

          {charge > 0 && (
            <div className={styles["learnpath-course-charge"]}>
              <small>￥</small>
              {charge}
            </div>
          )}
          {charge === 0 && <div className={styles["green-free"]}>免费</div>}
        </div>
      </div>
    </div>
  );
};
