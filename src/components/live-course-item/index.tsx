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
}
export const LiveCourseItem: React.FC<PropInterface> = ({
  cid,
  title,
  thumb,
  charge,
  category,
}) => {
  const navigate = useNavigate();

  const goDetail = () => {
    if (!cid) {
      return;
    }
    navigate("/live/detail/" + cid);
  };

  return (
    <div className={styles["live-course-item"]} onClick={() => goDetail()}>
      {!cid && <div className={styles["whiteback"]}></div>}
      <div className={styles["live-course-thumb"]}>
        <div className={styles["thumb-bar"]}>
          <ThumbBar value={thumb} width={264} height={198} border={null} />
        </div>
      </div>
      <div className={styles["live-course-body"]}>
        <div className={styles["live-course-title"]}>{title}</div>
        <div className={styles["live-course-info"]}>
          <div className={styles["live-course-sub"]}>
            {category && category.name}
          </div>
          <div className={styles["live-course-charge"]}>
            {charge > 0 && (
              <span className={styles["charge-text"]}>
                <span className={styles["unit"]}>￥</span>
                {charge}
              </span>
            )}
            {charge === 0 && <span className={styles["free-text"]}>免费</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
