import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { exam } from "../../api/index";
import { useSelector } from "react-redux";
import paperIcon from "../../assets/img/commen/test.png";
import mockpaperIcon from "../../assets/img/commen/virtual-test.png";
import practiceIcon from "../../assets/img/commen/practice.png";
import wrongbookIcon from "../../assets/img/commen/wrong-book.png";
import collectionIcon from "../../assets/img/commen/collect-paper.png";

const ExamPage = () => {
  document.title = "考试练习";
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({
    collection_count: 0,
    mock_papers_count: 0,
    papers_count: 0,
    practice_chapters_count: 0,
    practices_count: 0,
    wrong_book_count: 0,
  });
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    exam.list().then((res: any) => {
      setList(res.data);
      setLoading(false);
    });
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  return (
    <div className="container">
      <div className={styles["first-box"]}>
        <div className={styles["model"]}>
          <div
            className={styles["left-model"]}
            onClick={() => {
              if (!isLogin) {
                goLogin();
                return;
              }
              navigate("/exam/papers");
            }}
          >
            <div className={styles["title"]}>在线考试</div>
            <div className={styles["info"]}>{list.papers_count}套试卷</div>
            <img className={styles["icon"]} src={paperIcon} />
          </div>
          <div className={styles["right-model"]}>
            <div
              className={styles["mockpaper-model"]}
              onClick={() => {
                if (!isLogin) {
                  goLogin();
                  return;
                }
                navigate("/exam/mockpaper");
              }}
            >
              <div className={styles["title"]}>模拟考试</div>
              <div className={styles["info"]}>
                {list.mock_papers_count}套试卷
              </div>
              <img className={styles["icon"]} src={mockpaperIcon} />
            </div>
            <div
              className={styles["practice-model"]}
              onClick={() => {
                if (!isLogin) {
                  goLogin();
                  return;
                }
                navigate("/exam/practice");
              }}
            >
              <div className={styles["title"]}>练习模式</div>
              <div className={styles["info"]}>
                {list.practices_count}套练习
                {list.practice_chapters_count}个章节
              </div>
              <img className={styles["icon"]} src={practiceIcon} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles["second-box"]}>
        <div className={styles["model"]}>
          <div
            className={styles["wrongbook-model"]}
            onClick={() => {
              if (!isLogin) {
                goLogin();
                return;
              }
              navigate("/exam/wrongbook");
            }}
          >
            <div className={styles["title"]}>考试错题本</div>
            <div className={styles["info"]}>{list.wrong_book_count}道题</div>
            <img className={styles["icon"]} src={wrongbookIcon} />
          </div>
          <div
            className={styles["collect-model"]}
            onClick={() => {
              if (!isLogin) {
                goLogin();
                return;
              }
              navigate("/exam/collection");
            }}
          >
            <div className={styles["title"]}>收藏习题</div>
            <div className={styles["info"]}>{list.collection_count}道题</div>
            <img className={styles["icon"]} src={collectionIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
