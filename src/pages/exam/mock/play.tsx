import React, { useState, useEffect } from "react";
import styles from "./play.module.scss";
import { Modal, message, Button } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { mock, practice } from "../../../api/index";
import backIcon from "../../../assets/img/commen/icon-back-h.png";
import collectIcon from "../../../assets/img/commen/icon-collect-h.png";
import noCollectIcon from "../../../assets/img/commen/icon-collect-n.png";
import {
  ChoiceComp,
  SelectComp,
  InputComp,
  JudgeComp,
  QaComp,
  CapComp,
} from "../../../components";

var timer: any = null;
const ExamMockPaperPlayPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [userPaper, setUserPaper] = useState<any>({});
  const [paper, setPaper] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [activeQuestions, setActiveQuestions] = useState<any>({});
  const [collects, setCollects] = useState<any>({});
  const [surplus, setSurplus] = useState<number>(0);
  const [submitTip, setSubmitTip] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<any>({
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
  });
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [id, setId] = useState(Number(result.get("id")) || 0);
  const [pid, setPid] = useState(Number(result.get("pid")) || 0);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );

  useEffect(() => {
    getData();
    return () => {
      timer && clearInterval(timer);
    };
  }, [id, pid]);

  const getData = () => {
    mock.joinDetail(pid).then((res: any) => {
      document.title = res.data.paper.title;
      setPaper(res.data.paper);
      setUserPaper(res.data.record);
      let normaldata = res.data.questions;
      if (normaldata.length === 0) {
        message.error("未获取到试题");
        navigate("/exam/mockpaper");
        return;
      }
      let unread = 0;
      let obj: any = {};
      normaldata.forEach((item: any) => {
        if (!item.answer_content) {
          unread++;
        } else {
          obj[item.question_id] = true;
        }
      });
      setActiveQuestions(obj);
      setQuestions(normaldata);
      setSurplus(unread);
      let endTime: any = new Date(
        res.data.record.expired_at.replace(/-/g, "/")
      );
      const end: number = Math.floor(Date.parse(endTime));
      setTimestamp(end);
      if (res.data.record.status === 0) {
        countdown(end);
      } else if (res.data.record.status === 1) {
        getCollectStatus(normaldata);
      }
    });
  };

  const getCollectStatus = (normaldata: any) => {
    let data = normaldata;
    let ids = [];
    for (let i = 0; i < data.length; i++) {
      ids.push(data[i].question_id);
    }
    practice
      .collectionStatus({
        question_ids: ids,
      })
      .then((res: any) => {
        setCollects(res.data);
      });
  };

  const countdown = (timestamp: number) => {
    const today: any = new Date();
    const now = Date.parse(today);
    let remaining: number = (timestamp - now) / 1000;
    if (remaining <= 0) {
      finish();
      return;
    }
    timer = setInterval(() => {
      //防止出现负数
      if (remaining > 0) {
        remaining--;
        let day = Math.floor(remaining / 3600 / 24);
        let hour = Math.floor((remaining / 3600) % 24);
        let minute = Math.floor((remaining / 60) % 60);
        let second = Math.floor(remaining % 60);

        setRemainingTime({
          day: day,
          hr: hour < 10 ? "0" + hour : hour,
          min: minute < 10 ? "0" + minute : minute,
          sec: second < 10 ? "0" + second : second,
        });
      } else {
        finish();
      }
    }, 1000);
  };

  const finish = () => {
    timer && clearInterval(timer);
    submitHandle();
  };

  const submitHandle = () => {
    if (submitLoading) {
      return;
    }
    setSubmitLoading(true);
    mock
      .submitAll(pid, {
        pid: userPaper.id,
      })
      .then((res: any) => {
        setSubmitLoading(false);
        let status = res.data.status;
        let totalScore = res.data.total_score;
        setSubmitTip(false);
        message.success("考试结束，得分：" + totalScore);
        getData();
      })
      .catch((e) => {
        setSubmitLoading(false);
      });
  };

  const goBack = () => {
    if (userPaper.status === 1) {
      cancelAll();
      navigate(-1);
    }
  };

  const ok = () => {
    setSubmitTip(false);
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  const cancelAll = () => {
    setSubmitTip(false);
  };

  const goDetail = (val: number) => {
    let ele = document.getElementById(String(val)) as HTMLElement;
    document.documentElement.scrollTop = ele.offsetTop;
  };

  const submitAll = () => {
    setSubmitTip(true);
  };

  const collectAnswer = (qid: number) => {
    let box = { ...collects };
    practice
      .collect({
        question_id: qid,
      })
      .then(() => {
        if (box[qid] === 1) {
          message.success("已取消收藏");
          box[qid] = 0;
          setCollects(box);
        } else {
          message.success("已收藏试题");
          box[qid] = 1;
          setCollects(box);
        }
      });
  };

  const questionUpdate = (qid: string, answer: string, thumbs: any) => {
    let params: any = {
      pid: pid,
      answer: answer,
      question_id: qid,
    };
    if (thumbs) {
      params = {
        pid: pid,
        images: thumbs,
        answer: answer,
        question_id: qid,
      };
    }
    mock.submitSingle(pid, params).then((res: any) => {
      let obj: any = activeQuestions;
      if (typeof qid == "string" && qid.indexOf("-") != -1) {
        if (answer === "") {
          if (thumbs && thumbs.length > 0) {
            let key = qid.substring(0, qid.indexOf("-"));
            obj[key] = true;
            setActiveQuestions(obj);
          } else {
            let key = qid.substring(0, qid.indexOf("-"));
            obj[key] = false;
            setActiveQuestions(obj);
          }
        } else {
          let key = qid.substring(0, qid.indexOf("-"));
          obj[key] = true;
          setActiveQuestions(obj);
        }
      } else {
        if (answer === "") {
          if (thumbs && thumbs.length > 0) {
            obj[qid] = true;
            setActiveQuestions(obj);
          } else {
            obj[qid] = false;
            setActiveQuestions(obj);
          }
        } else {
          obj[qid] = true;
          setActiveQuestions(obj);
        }
      }
      let num = Object.keys(obj).length;

      let surplus = questions.length - num;
      setSurplus(surplus);
    });
  };

  return (
    <div className="full-container">
      {submitTip ? (
        <Modal
          title="确认信息"
          centered
          forceRender
          maskClosable={false}
          open={true}
          width={500}
          onCancel={() => setSubmitTip(false)}
          footer={null}
        >
          {surplus !== 0 && (
            <div className={styles["text"]}>
              还有{surplus}道题未做，确认要交卷吗？
            </div>
          )}
          {surplus === 0 && (
            <div className={styles["text"]}>确认要交卷吗？</div>
          )}
          <div
            slot="footer"
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              marginTop: 15,
            }}
          >
            <Button
              type="primary"
              onClick={() => finish()}
              loading={submitLoading}
            >
              确定
            </Button>
            <Button
              style={{ marginRight: 15 }}
              onClick={() => setSubmitTip(false)}
            >
              继续答题
            </Button>
          </div>
        </Modal>
      ) : null}
      <div className={styles["navheader"]}>
        <div className={styles["top"]}>
          {userPaper && userPaper.status === 0 && (
            <div className={styles["top-left"]}>{paper.title}</div>
          )}
          {userPaper && userPaper.status === 1 && (
            <div className={styles["top-left"]} onClick={() => goBack()}>
              <img className={styles["icon-back"]} src={backIcon} />
              {paper.title}
            </div>
          )}
          <div className={styles["top-right"]}>
            {userPaper && userPaper.status === 1 && (
              <div className={styles["score"]}>
                考试得分：<strong>{userPaper.get_score}分</strong>
              </div>
            )}
            {userPaper && userPaper.status === 0 && (
              <>
                <div className={styles["score-info"]}>
                  及格分：{paper.pass_score}分/{userPaper.total_score}分
                </div>
                <div className={styles["remaining-time"]}>
                  倒计时：
                  {remainingTime.hr}时{remainingTime.min}分{remainingTime.sec}秒
                </div>
                <div className={styles["button"]} onClick={() => submitAll()}>
                  立即交卷
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles["paper-box"]}>
        <div className={styles["fix-left-box"]}>
          {questions.length > 0 && userPaper && userPaper.status === 0 && (
            <div className={styles["number-box"]}>
              {questions.map((item: any, index: number) => (
                <div
                  key={index}
                  className={
                    activeQuestions[item.question_id]
                      ? styles["active-num"]
                      : styles["num"]
                  }
                  onClick={() => goDetail(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          {questions.length > 0 && userPaper && userPaper.status === 1 && (
            <div className={styles["number-box"]}>
              {questions.map((item: any, index: number) => (
                <div
                  key={index}
                  className={
                    item.is_correct === 1
                      ? styles["correct-num"]
                      : item.is_correct === 0
                      ? styles["error-num"]
                      : item.is_correct === 2
                      ? styles["act-num"]
                      : item.is_correct === 3
                      ? styles["no-num"]
                      : styles["num"]
                  }
                  onClick={() => goDetail(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles["right-box"]}>
          {questions.length > 0 && userPaper && (
            <div className={styles["questions-box"]}>
              {questions.map((item: any, index: number) => (
                <div key={index} className={styles["item"]} id={String(index)}>
                  {userPaper.status === 1 && (
                    <div
                      className={styles["collect-icon"]}
                      onClick={() => collectAnswer(item.question_id)}
                    >
                      {collects[item.question_id] === 1 && (
                        <>
                          <img src={collectIcon} />
                          <strong>已收藏</strong>
                        </>
                      )}
                      {collects[item.question_id] !== 1 && (
                        <>
                          <img src={noCollectIcon} />
                          收藏试题
                        </>
                      )}
                    </div>
                  )}
                  {/* 单选 */}
                  {item.question.type === 1 && (
                    <ChoiceComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_content}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></ChoiceComp>
                  )}
                  {/* 多选 */}
                  {item.question.type === 2 && (
                    <SelectComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_contents_rows}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></SelectComp>
                  )}
                  {/* 填空 */}
                  {item.question.type === 3 && (
                    <InputComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_contents_rows}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></InputComp>
                  )}
                  {/* 问答 */}
                  {item.question.type === 4 && (
                    <QaComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_content}
                      thumbs={item.thumbs_rows}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      showImage={true}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></QaComp>
                  )}
                  {/* 判断 */}
                  {item.question.type === 5 && (
                    <JudgeComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_contents_rows}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></JudgeComp>
                  )}
                  {/* 题帽题 */}
                  {item.question.type === 6 && (
                    <CapComp
                      key={item.question_id}
                      num={index + 1}
                      question={item.question}
                      reply={item.answer_contents_rows}
                      score={item.score}
                      isCorrect={item.is_correct}
                      isOver={userPaper.status === 1}
                      showImage={true}
                      wrongBook={false}
                      update={(id: string, value: string, thumbs: any) => {
                        questionUpdate(id, value, thumbs);
                      }}
                    ></CapComp>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamMockPaperPlayPage;
