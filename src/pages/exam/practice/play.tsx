import React, { useState, useEffect } from "react";
import styles from "./play.module.scss";
import { Modal, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { practice } from "../../../api/index";
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
import { NumberSheet } from "./components/number-sheet";

const ExamPracticePlayPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>({});
  const [question, setQuestion] = useState<any>([]);
  const [qidArr, setQidArr] = useState<any>([]);
  const [activeQid, setActiveQid] = useState(1);
  const [isCollected, setIsCollected] = useState<boolean>(false);
  const [configkey, setConfigkey] = useState<any>({});
  const [hasPracticeQuestionIds, setHasPracticeQuestionIds] = useState<any>([]);
  const [answerContent, setAnswerContent] = useState<any>([]);
  const [showText, setShowText] = useState<string>("对答案");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [toastActive, setToastActive] = useState<boolean>(true);
  const [day, setDay] = useState(Number(result.get("day")) || 0);
  const [pid, setPid] = useState(Number(result.get("practiceId")) || 0);
  const [cid, setCid] = useState(Number(result.get("chapterId")) || 0);

  useEffect(() => {
    getData();
  }, [day, pid, cid]);

  useEffect(() => {
    keyDown();
    setShowAnswer(false);
    setShowText("对答案");
    getQuestion();
  }, [activeQid]);

  useEffect(() => {
    keyDown();
  }, [activeQid, qidArr]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    if (day === 1) {
      practice.practiceDayPlay(pid).then((res: any) => {
        document.title = res.data.practice.name;
        setList(res.data.practice);
        setHasPracticeQuestionIds([]);
        setQuestion(res.data.first_question);
        setQidArr(res.data.qid_arr);
        setLoading(false);
        collectStatus(res.data.first_question);
        let obj: any = {};
        for (var i = 0; i < res.data.qid_arr.length; i++) {
          obj[res.data.qid_arr[i]] = false;
        }
        setConfigkey(obj);
      });
    } else {
      practice.practicePlay(pid, cid).then((res: any) => {
        document.title = res.data.practice.name;
        setList(res.data.practice);
        setHasPracticeQuestionIds(res.data.has_practice_question_ids);
        setQuestion(res.data.first_question);
        setQidArr(res.data.qid_arr);
        setLoading(false);
        collectStatus(res.data.first_question);
        let obj: any = {};
        for (var i = 0; i < res.data.qid_arr.length; i++) {
          obj[res.data.qid_arr[i]] = false;
        }
        setConfigkey(obj);
      });
    }
  };

  const getQuestion = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    setQuestion([]);
    setAnswerContent([]);
    let questionId = qidArr[activeQid - 1];
    if (questionId) {
      practice.practiceQuestion(pid, questionId).then((res: any) => {
        let data = res.data.question;
        data.answer_content = "";
        setQuestion(data);
        collectStatus(data);
        setLoading(false);
      });
    }
  };

  const collectStatus = (data: any) => {
    practice.collectStatus({ question_id: data.id }).then((res: any) => {
      if (res.data.status === 1) {
        setIsCollected(true);
      } else {
        setIsCollected(false);
      }
    });
  };

  const collectAnswer = () => {
    practice.collect({ question_id: question.id }).then(() => {
      if (isCollected) {
        message.success("已取消收藏");
      } else {
        message.success("已收藏试题");
      }
      setIsCollected(!isCollected);
    });
  };

  const keyDown = () => {
    document.onkeydown = (e) => {
      let e1 = e || event || window.event;

      //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
      setLoading(false);
      if (e1 && e1.keyCode == 37) {
        if (activeQid === 1) {
          message.error("没有上一题了");
        } else {
          let num = activeQid;
          num--;
          setActiveQid(num);
        }
      } else if (e1 && e1.keyCode == 39) {
        if (activeQid === qidArr.length) {
          message.error("没有下一题了");
        } else {
          let num = activeQid;
          num++;
          setActiveQid(num);
        }
      }
    };
  };

  const goBack = () => {
    navigate(-1);
  };

  const changeQid = (val: number) => {
    setActiveQid(val);
  };

  const seeAnswer = () => {
    let questionId = qidArr[activeQid - 1];
    let config = configkey;
    config[questionId] = true;
    setConfigkey(config);
    let isShow = showAnswer;
    if (isShow === true) {
      setShowText("对答案");
    } else {
      setShowText("收起答案");
    }
    setShowAnswer(!isShow);
    if (!isShow) {
      practice
        .practiceQuestionAnswerFill(pid, questionId, {
          answer: answerContent,
        })
        .then((res) => {
          //
        });
    }
  };

  const prevPage = () => {
    if (toastActive) {
      message.info("可通过键盘← →方向键快速切题哦！");
    }
    if (loading) {
      return;
    }
    if (activeQid === 1) {
      message.error("没有上一题了");
    } else {
      let num = activeQid;
      num--;
      setActiveQid(num);
    }
    setToastActive(false);
  };

  const nextPage = () => {
    if (toastActive) {
      message.info("可通过键盘← →方向键快速切题哦！");
    }
    if (loading) {
      return;
    }
    if (activeQid === qidArr.length) {
      message.error("没有下一题了");
    } else {
      let num = activeQid;
      num++;
      setActiveQid(num);
    }
    setToastActive(false);
  };

  const questionUpdate = (qid: string, answer: string, thumbs: any) => {
    if (question && question.type === 6) {
      let data = qid.split("-");
      let index = parseInt(data[2]);
      let arr: any = [...answerContent];
      arr[index] = answer;
      setAnswerContent(arr);
    } else {
      setAnswerContent(answer);
    }
    if (question && (question.type === 1 || question.type === 5)) {
      seeAnswer();
    }
  };

  return (
    <div className="full-container">
      <div className={styles["navheader"]}>
        <div className={styles["top"]}>
          <div className={styles["left-top"]} onClick={() => goBack()}>
            <img className={styles["icon-back"]} src={backIcon} />
            {list.name}
          </div>
          <div className={styles["right-top"]}>
            <div className={styles["prev-button"]} onClick={() => prevPage()}>
              上一题
            </div>
            <div className={styles["next-button"]} onClick={() => nextPage()}>
              下一题
            </div>
          </div>
        </div>
      </div>
      <div className={styles["project-box"]}>
        <div className={styles["left-box"]}>
          {qidArr && (
            <NumberSheet
              activeNum={activeQid}
              qidArr={qidArr}
              configkey={configkey}
              hasPracticeIds={hasPracticeQuestionIds}
              change={(val: number) => changeQid(val)}
            ></NumberSheet>
          )}
        </div>
        <div className={styles["right-box"]}>
          {list && question && (
            <>
              <div
                className={styles["delete-icon"]}
                onClick={() => collectAnswer()}
              >
                {isCollected && (
                  <>
                    <img src={collectIcon} />
                    <strong>已收藏</strong>
                  </>
                )}
                {!isCollected && (
                  <>
                    <img src={noCollectIcon} />
                    收藏试题
                  </>
                )}
              </div>
              <div className={styles["practice-join-box"]}>
                {/* 单选 */}
                {question.type === 1 && (
                  <ChoiceComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={null}
                    score={question.score}
                    isCorrect={0}
                    isOver={showAnswer}
                    wrongBook={true}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></ChoiceComp>
                )}
                {/* 多选 */}
                {question.type === 2 && (
                  <SelectComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={""}
                    score={question.score}
                    isCorrect={0}
                    isOver={showAnswer}
                    wrongBook={true}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></SelectComp>
                )}
                {/* 填空 */}
                {question.type === 3 && (
                  <InputComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={""}
                    score={question.score}
                    isCorrect={0}
                    isOver={showAnswer}
                    wrongBook={true}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></InputComp>
                )}
                {/* 问答 */}
                {question.type === 4 && (
                  <QaComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={null}
                    score={question.score}
                    isCorrect={0}
                    thumbs={[]}
                    isOver={showAnswer}
                    showImage={false}
                    wrongBook={true}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></QaComp>
                )}
                {/* 判断 */}
                {question.type === 5 && (
                  <JudgeComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={null}
                    score={question.score}
                    isCorrect={0}
                    isOver={showAnswer}
                    wrongBook={true}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></JudgeComp>
                )}
                {/* 题帽题 */}
                {question.type === 6 && (
                  <CapComp
                    key={question.id}
                    num={activeQid}
                    question={question}
                    reply={null}
                    score={question.score}
                    isCorrect={0}
                    isOver={showAnswer}
                    wrongBook={true}
                    showImage={false}
                    update={(id: string, value: string, thumbs: any) => {
                      questionUpdate(id, value, thumbs);
                    }}
                  ></CapComp>
                )}
              </div>
            </>
          )}
          {question &&
            (question.type === 2 ||
              question.type === 3 ||
              question.type === 4 ||
              question.type === 6) && (
              <div className={styles["buttons-box"]}>
                <div
                  className={styles["see-answer"]}
                  onClick={() => seeAnswer()}
                >
                  {showText}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExamPracticePlayPage;
