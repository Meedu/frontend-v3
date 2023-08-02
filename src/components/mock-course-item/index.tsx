import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import paperIcon from "../../assets/img/member/mock.png";
import paperLockIcon from "../../assets/img/exam/mock-lock.png";

interface PropInterface {
  cid: number;
  title: string;
  charge: number;
  records: any[];
  isFree: boolean;
  expiredMinutes: number;
  questionsCount: number;
}

export const MockCourseItem: React.FC<PropInterface> = ({
  cid,
  title,
  charge,
  records,
  isFree,
  expiredMinutes,
  questionsCount,
}) => {
  const navigate = useNavigate();
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  const goDetail = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate("/exam/mockpaper/detail/" + cid);
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  return (
    <div className={styles["paper-item-comp"]}>
      {records[cid] && <div className={styles["status"]}>已参考</div>}
      <div className={styles["title"]}>
        <img className={styles["icon"]} src={paperIcon} />
        <div className={styles["name"]}>{title}</div>
      </div>
      <div className={styles["button"]} onClick={() => goDetail()}>
        {!isFree && <img className={styles["icon"]} src={paperLockIcon} />}
        <span>立即考试</span>
      </div>
    </div>
  );
};
