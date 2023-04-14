import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { wrongbook } from "../../../api/index";

export const ExamWrongbookPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({});
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    wrongbook.detail({}).then((res: any) => {
      setList(res.data.types_count);
      setLoading(false);
    });
  };

  const run = (mode: string) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate("/exam/wrongbook/play?mode=" + mode);
  };

  const goDetail = (type: number) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (list[type] === 0) {
      return;
    }
    navigate("/exam/wrongbook/play?type=" + type);
  };

  const goLogin = () => {
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="bread-nav">
        <a
          onClick={() => {
            navigate("/exam");
          }}
        >
          考试练习
        </a>{" "}
        /<span>考试错题本</span>
      </div>
      <div className={styles["banner"]}>
        <div className={styles["tit"]}>考试错题本</div>
        <div className={styles["btn-box"]}>
          <div className={styles["btn-all-play"]} onClick={() => run("order")}>
            全部练习
          </div>
        </div>
      </div>
      <div className={styles["question-box"]}>
        {list[1] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(1)}>
            <div className={styles["question-item-type"]}>单选题</div>
            <div className={styles["question-item-num"]}>共{list[1]}题错题</div>
          </div>
        )}
        {list[2] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(2)}>
            <div className={styles["question-item-type"]}>多选题</div>
            <div className={styles["question-item-num"]}>共{list[2]}题错题</div>
          </div>
        )}
        {list[5] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(5)}>
            <div className={styles["question-item-type"]}>判断题</div>
            <div className={styles["question-item-num"]}>共{list[5]}题错题</div>
          </div>
        )}
        {list[3] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(3)}>
            <div className={styles["question-item-type"]}>填空题</div>
            <div className={styles["question-item-num"]}>共{list[3]}题错题</div>
          </div>
        )}
        {list[4] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(4)}>
            <div className={styles["question-item-type"]}>问答题</div>
            <div className={styles["question-item-num"]}>共{list[4]}题错题</div>
          </div>
        )}
        {list[6] > 0 && (
          <div className={styles["question-item"]} onClick={() => goDetail(6)}>
            <div className={styles["question-item-type"]}>题帽题</div>
            <div className={styles["question-item-num"]}>共{list[1]}题错题</div>
          </div>
        )}
      </div>
    </div>
  );
};