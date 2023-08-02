import React from "react";
import styles from "./index.module.scss";
import { ThumbBar } from "../thumb-bar";
import { useNavigate } from "react-router-dom";

interface PropInterface {
  cid: number;
  name: string;
  thumb: string;
  charge: number;
  viewTimes: number;
  isVipFree: boolean;
  shortDesc: string;
  userCount: number;
  publishedAt: string;
}

export const BookCourseItem: React.FC<PropInterface> = ({
  cid,
  name,
  thumb,
  charge,
  viewTimes,
  isVipFree,
  shortDesc,
  userCount,
  publishedAt,
}) => {
  const navigate = useNavigate();
  const goDetail = () => {
    navigate("/book/detail/" + cid);
  };

  return (
    <div className={styles["book-item-comp"]} onClick={() => goDetail()}>
      <div className={styles["book-thumb"]}>
        <div className={styles["thumb-bar"]}>
          <ThumbBar value={thumb} width={120} height={160} border={null} />
        </div>
      </div>
      <div className={styles["book-body"]}>
        <div className={styles["book-info"]}>
          <div className={styles["book-name"]}>{name}</div>
        </div>
        <div className={styles["book-desc"]}>{shortDesc}</div>
        <div className={styles["book-charge"]}>
          {charge !== 0 && (
            <div className={styles["charge-text"]}>
              <span className={styles["unit"]}>￥</span>
              {charge}
            </div>
          )}
          {charge === 0 && <div className={styles["free-text"]}>免费</div>}
        </div>
      </div>
    </div>
  );
};
