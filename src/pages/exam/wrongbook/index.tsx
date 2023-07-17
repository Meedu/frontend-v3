import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Skeleton, Button, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { wrongbook } from "../../../api/index";

const ExamWrongbookPage = () => {
  document.title = "考试错题本";
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
    if (
      list[1] === 0 &&
      list[2] === 0 &&
      list[3] === 0 &&
      list[4] === 0 &&
      list[5] === 0 &&
      list[6] === 0
    ) {
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
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
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
          <Button
            type="primary"
            loading={loading}
            className={styles["btn-all-play"]}
            onClick={() => run("order")}
          >
            全部练习
          </Button>
        </div>
      </div>
      <div className={styles["question-box"]}>
        {loading && (
          <>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>单选题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>多选题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>判断题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>填空题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>问答题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
            <div className={styles["question-item"]}>
              <div className={styles["question-item-type"]}>题帽题</div>
              <Skeleton.Button
                active
                style={{
                  width: 80,
                  height: 20,
                }}
              ></Skeleton.Button>
            </div>
          </>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[1] === 0) {
                return;
              }
              goDetail(1);
            }}
          >
            <div className={styles["question-item-type"]}>单选题</div>
            <div className={styles["question-item-num"]}>共{list[1]}题错题</div>
          </div>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[2] === 0) {
                return;
              }
              goDetail(2);
            }}
          >
            <div className={styles["question-item-type"]}>多选题</div>
            <div className={styles["question-item-num"]}>共{list[2]}题错题</div>
          </div>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[5] === 0) {
                return;
              }
              goDetail(5);
            }}
          >
            <div className={styles["question-item-type"]}>判断题</div>
            <div className={styles["question-item-num"]}>共{list[5]}题错题</div>
          </div>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[3] === 0) {
                return;
              }
              goDetail(3);
            }}
          >
            <div className={styles["question-item-type"]}>填空题</div>
            <div className={styles["question-item-num"]}>共{list[3]}题错题</div>
          </div>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[4] === 0) {
                return;
              }
              goDetail(4);
            }}
          >
            <div className={styles["question-item-type"]}>问答题</div>
            <div className={styles["question-item-num"]}>共{list[4]}题错题</div>
          </div>
        )}
        {!loading && (
          <div
            className={styles["question-item"]}
            onClick={() => {
              if (list[6] === 0) {
                return;
              }
              goDetail(6);
            }}
          >
            <div className={styles["question-item-type"]}>题帽题</div>
            <div className={styles["question-item-num"]}>共{list[6]}题错题</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamWrongbookPage;
