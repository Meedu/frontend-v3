import { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Skeleton, message } from "antd";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { practice } from "../../../api/index";
import { Empty } from "../../../components";

const ExamPracticeDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [chapters, setChapters] = useState<any>([]);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [practiceUserRecord, setPracticeUserRecord] = useState<any>(null);
  const [userChapterRecords, setUserChapterRecords] = useState<any>([]);
  const [surplus, setSurplus] = useState<number>(99999);
  const [sumQuestion, setSumQuestion] = useState<number>(0);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [id, setId] = useState(Number(params.courseId) || 0);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getDetail();
  }, [id]);

  useEffect(() => {
    setId(Number(params.courseId));
  }, [params.courseId]);

  useEffect(() => {
    let val = 0;
    for (var key in questions) {
      val = val + questions[key].length;
    }
    setSumQuestion(val);
  }, [questions]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    practice
      .detail(id)
      .then((res: any) => {
        document.title = res.data.practice.name;
        setList(res.data.practice);
        setChapters(res.data.chapters);
        setCanJoin(res.data.can);
        setPracticeUserRecord(res.data.practice_user_record);
        setUserChapterRecords(res.data.user_chapter_records);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const chapterSubmitCount = (chapter: any) => {
    if (typeof userChapterRecords[chapter.id] === "undefined") {
      return 0;
    }
    return userChapterRecords[chapter.id].submit_count;
  };

  const join = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (canJoin === false) {
      message.error("无权限参与");
      return;
    }
    if (list.question_count === 0) {
      message.error("当前练习为空");
      return;
    }
    navigate("/exam/practice/play?day=1&practiceId=" + id);
  };

  const goPracticeChapter = (chapter: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (joinLoading) {
      return;
    }
    if (chapter.question_count === 0) {
      message.error("无试题");
      return;
    }
    if (canJoin === false) {
      message.error("无权限参与");
      return;
    }
    navigate(
      "/exam/practice/play?practiceId=" + id + "&chapterId=" + chapter.id
    );
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  const payVIP = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate("/vip");
  };

  const payOrder = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (list.charge === 0) {
      message.error("当前练习无法购买");
      return;
    }

    navigate(
      "/order?goods_id=" +
        id +
        "&goods_type=practice&goods_charge=" +
        list.charge +
        "&goods_label=练习&goods_name=" +
        list.name
    );
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
        /
        <a
          onClick={() => {
            navigate("/exam/practice");
          }}
        >
          练习模式
        </a>{" "}
        /<span>{list.name}</span>
      </div>
      <div className={styles["banner-box"]}>
        {loading && (
          <div
            style={{
              width: 1200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton.Button
              active
              style={{
                width: 300,
                height: 28,
                marginTop: 50,
                marginBottom: 30,
              }}
            ></Skeleton.Button>
            <Skeleton.Button
              active
              style={{
                width: 600,
                height: 14,
                marginBottom: 50,
              }}
            ></Skeleton.Button>
            <Skeleton.Button
              active
              style={{
                width: 104,
                height: 40,
                borderRadius: 4,
              }}
            ></Skeleton.Button>
          </div>
        )}
        {!loading && (
          <>
            <div className={styles["title"]}>{list.name}</div>
            <div className={styles["info"]}>
              <div className={styles["info-item"]}>
                已练习：
                {practiceUserRecord ? practiceUserRecord.submit_count : 0}/
                {list.question_count || 0}
              </div>
            </div>
            <div className={styles["btn-box"]}>
              <>
                {!canJoin && list.charge > 0 && (
                  <div
                    className={styles["charge-button"]}
                    onClick={() => payOrder()}
                  >
                    购买练习 ￥{list.charge}
                  </div>
                )}
                {canJoin && surplus && surplus !== 0 && (
                  <div className={styles["join-button"]} onClick={() => join()}>
                    每日20题
                  </div>
                )}
              </>
            </div>
          </>
        )}
      </div>
      <div className={styles["records-box"]}>
        <div className={styles["records"]}>
          {loading && (
            <div
              style={{
                width: 1200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles["record-item"]}>
                  <Skeleton.Button
                    active
                    style={{
                      width: 1140,
                      height: 16,
                    }}
                  ></Skeleton.Button>
                </div>
              ))}
            </div>
          )}
          {!loading && chapters.length === 0 && <Empty></Empty>}
          {!loading && chapters.length > 0 && (
            <>
              {chapters.map((item: any) => (
                <div
                  key={item.id}
                  className={styles["record-item"]}
                  onClick={() => goPracticeChapter(item)}
                >
                  <div className={styles["item-name"]}>{item.name}</div>
                  <div className={styles["item-progress"]}>
                    <span>
                      已练习{chapterSubmitCount(item)}/{item.question_count}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPracticeDetailPage;
