import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import paperIcon from "../../assets/img/member/practice.png";
import paperLockIcon from "../../assets/img/exam/practice-lock.png";

interface PropInterface {
  cid: number;
  title: string;
  charge: number;
  userCount: number;
  category: any;
  records: any[];
  isFree: number;
  isVipFree: number;
  questionCount: number;
}

export const PracticeCourseItem: React.FC<PropInterface> = ({
  cid,
  title,
  charge,
  userCount,
  category,
  records,
  isFree,
  isVipFree,
  questionCount,
}) => {
  const navigate = useNavigate();
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  const goDetail = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate("/exam/practice/detail/" + cid);
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  return (
    <div className={styles["paper-item-comp"]}>
      {userCount !== 0 && (
        <>
          {userCount === questionCount && (
            <div className={styles["status"]}>已练习</div>
          )}
          {userCount !== questionCount && (
            <div className={styles["status"]}>练习中</div>
          )}
        </>
      )}
      <div className={styles["title"]}>
        <img className={styles["icon"]} src={paperIcon} />
        <div className={styles["name"]}>{title}</div>
      </div>
      <div className={styles["button"]} onClick={() => goDetail()}>
        {!isFree && <img className={styles["icon"]} src={paperLockIcon} />}
        <span>立即练习</span>
      </div>
    </div>
  );
};
