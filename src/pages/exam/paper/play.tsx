import React, { useState, useEffect } from "react";
import styles from "./play.module.scss";
import { Modal, message, Button } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { paper as examPaper, practice } from "../../../api/index";
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
const ExamPaperPlayPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [userPaper, setUserPaper] = useState<any>({});
  const [paper, setPaper] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [activeQuestions, setActiveQuestions] = useState<any>({});
  const [collects, setCollects] = useState<any>({});
  const [surplus, setSurplus] = useState<number>(0);
  const [dialogStatus, setDialogStatus] = useState<boolean>(false);
  const [readTip, setReadTip] = useState<boolean>(false);
  const [submitTip, setSubmitTip] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [workTime, setWorkTime] = useState<number>(0);
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
    examPaper.paperJoinRecord(id, pid).then((res: any) => {
      document.title = res.data.paper.title;
      setPaper(res.data.paper);
      setUserPaper(res.data.user_paper);
      let normaldata = res.data.questions;
      if (normaldata.length === 0) {
        message.error("未获取到试题");
        navigate("/exam/papers");
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
        res.data.user_paper.ended_at.replace(/-/g, "/")
      );
      const end: number = Math.floor(Date.parse(endTime));
      setTimestamp(end);
      if (res.data.user_paper.status === 1) {
        countdown(end);
      } else if (res.data.user_paper.status === 2) {
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
      let workTime = parseInt(paper.expired_minutes) * 60;
      setWorkTime(workTime);
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
        let workTime =
          parseInt(paper.expired_minutes) * 60 - Math.floor(remaining);
        setWorkTime(workTime);
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
    examPaper
      .paperSubmit(id, {
        pid: pid,
      })
      .then((res: any) => {
        setSubmitLoading(false);
        let status = res.data.status;
        let totalScore = res.data.total_score;
        setSubmitTip(false);
        if (status === 2) {
          message.success("考试结束，得分：" + totalScore);
          getData();
        } else {
          setReadTip(true);
        }
      })
      .catch((e) => {
        setSubmitLoading(false);
      });
  };

  const goBack = () => {
    if (userPaper.status === 1) {
      setDialogStatus(false);
    } else {
      cancelAll();
      navigate(-1);
    }
  };

  const ok = () => {
    setReadTip(false);
    setSubmitTip(false);
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  const cancelAll = () => {
    setReadTip(false);
    setSubmitTip(false);
    setDialogStatus(false);
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
    examPaper.paperSubmitSingle(id, params).then((res: any) => {
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
      {dialogStatus ? (
        <Modal
          title="确认信息"
          centered
          forceRender
          maskClosable={false}
          open={true}
          width={500}
          onOk={() => {
            cancelAll();
            setTimeout(() => {
              navigate(-1);
            }, 500);
          }}
          onCancel={() => setDialogStatus(false)}
        >
          <div className={styles["text"]}>正在考试中,是否确认返回?</div>
        </Modal>
      ) : null}
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
      {readTip ? (
        <Modal
          title="交卷提示"
          centered
          forceRender
          maskClosable={false}
          open={true}
          width={500}
          closable={false}
          footer={null}
        >
          <div className={styles["text"]}>
            此次在线考试包含主观题，等待老师阅卷后查看成绩
          </div>
          <div
            slot="footer"
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              marginTop: 15,
            }}
          >
            <Button type="primary" onClick={() => ok()}>
              我知道了
            </Button>
          </div>
        </Modal>
      ) : null}
      <div className={styles["navheader"]}>
        <div className={styles["top"]}>
          {userPaper && userPaper.status === 1 && (
            <div className={styles["top-left"]}>{paper.title}</div>
          )}
          {userPaper && userPaper.status === 2 && (
            <div className={styles["top-left"]} onClick={() => goBack()}>
              <img className={styles["icon-back"]} src={backIcon} />
              {paper.title}
            </div>
          )}
          <div className={styles["top-right"]}>
            {userPaper && userPaper.status === 2 && (
              <div className={styles["score"]}>
                考试得分：<strong>{userPaper.score}分</strong>
              </div>
            )}
            {userPaper && userPaper.status === 1 && (
              <>
                <div className={styles["score-info"]}>
                  及格分：{paper.pass_score}分/{paper.score}分
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
          {questions.length > 0 && userPaper && userPaper.status === 1 && (
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
          {questions.length > 0 && userPaper && userPaper.status === 2 && (
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
                  {userPaper.status === 2 && (
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
                      isOver={userPaper.status === 2}
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
                      isOver={userPaper.status === 2}
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
                      isOver={userPaper.status === 2}
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
                      isOver={userPaper.status === 2}
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
                      isOver={userPaper.status === 2}
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
                      isOver={userPaper.status === 2}
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

export default ExamPaperPlayPage;
