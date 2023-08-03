import React, { useState, useEffect } from "react";
import styles from "./play.module.scss";
import { Modal, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { wrongbook } from "../../../api/index";
import backIcon from "../../../assets/img/commen/icon-back-h.png";
import delIcon from "../../../assets/img/icon-delete-h.png";
import {
  FilterExamCategories,
  ChoiceComp,
  SelectComp,
  InputComp,
  JudgeComp,
  QaComp,
  CapComp,
} from "../../../components";
import { NumberSheet } from "./components/number-sheet";

const ExamWrongbookPlayPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [question, setQuestion] = useState<any>([]);
  const [qidArr, setQidArr] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [activeQid, setActiveQid] = useState(1);
  const [answerContent, setAnswerContent] = useState<any>([]);
  const [showText, setShowText] = useState<string>("对答案");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [toastActive, setToastActive] = useState<boolean>(true);
  const [cid, setCid] = useState(0);
  const [child, setChild] = useState(0);
  const [configkey, setConfigkey] = useState<any>({});
  const [type, setType] = useState(Number(result.get("type")));
  const [mode, setMode] = useState(Number(result.get("mode")));
  const [openmask, setOpenmask] = useState<boolean>(false);

  useEffect(() => {
    getParams();
    getData();
  }, [type, mode, cid, child]);

  useEffect(() => {
    keyDown();
    setShowAnswer(false);
    setShowText("对答案");
    getQuestion();
  }, [activeQid]);

  const getParams = () => {
    wrongbook
      .detail({
        question_type: type,
      })
      .then((res: any) => {
        let categories_count = res.data.categories_count;
        let categories = res.data.categories;
        let count = 0;
        for (let i = 0; i < categories.length; i++) {
          categories[i].name =
            categories[i].name + "(" + categories_count[categories[i].id] + ")";
          count = count + categories_count[categories[i].id];
          if (categories[i].children.length > 0) {
            let children = categories[i].children;
            for (let j = 0; j < children.length; j++) {
              children[j].name =
                children[j].name + "(" + categories_count[children[j].id] + ")";
            }
            categories[i].children.unshift({
              id: 0,
              name: "全部(" + categories_count[categories[i].id] + ")",
            });
          }
        }
        categories.unshift({
          id: 0,
          name: "全部(" + count + ")",
        });
        setCategories(categories);
      });
  };

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    wrongbook
      .orderMode({
        type: type,
        cid1: cid,
        cid2: child,
      })
      .then((res: any) => {
        setQuestion(res.data.first_question);
        setQidArr(res.data.questions_ids);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getQuestion = () => {
    if (loading) {
      return;
    }
    setQuestion([]);
    setAnswerContent([]);
    let questionId = qidArr[activeQid - 1];
    if (!questionId) {
      return;
    }
    setLoading(true);
    wrongbook
      .newQuestion(questionId, {
        from: "wrongbook",
      })
      .then((res: any) => {
        let data = res.data.question;
        data.answer_content = "";
        setQuestion(data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const submitHandle = () => {
    wrongbook
      .removeQuestion(question.id)
      .then((res: any) => {
        setOpenmask(false);
        message.success("操作成功，下次进入将不会看到该试题");
        let num = activeQid;
        let arr = qidArr;
        arr.splice(activeQid - 1, 1);
        setQidArr(arr);
        if (num > arr.length) {
          num--;
          setActiveQid(num);
        } else {
          setShowAnswer(false);
          setShowText("对答案");
          getQuestion();
        }
      })
      .catch((e) => {
        setOpenmask(false);
      });
  };

  const removeAnswer = () => {
    setOpenmask(true);
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
      wrongbook
        .questionAnswerFill(questionId, {
          answer: answerContent,
          from: "wrongbook",
        })
        .then((res) => {
          //
        });
    }
  };

  const goBack = () => {
    setOpenmask(false);
    navigate(-1);
  };

  const keyDown = () => {
    document.onkeydown = (e) => {
      let e1 = e || event || window.event;
      setLoading(false);
      //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
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

  const changeQid = (val: number) => {
    setActiveQid(val);
  };

  return (
    <div className="full-container">
      {openmask ? (
        <Modal
          title="确认信息"
          centered
          forceRender
          maskClosable={false}
          open={true}
          width={500}
          onOk={() => {
            submitHandle();
          }}
          onCancel={() => setOpenmask(false)}
        >
          <div className={styles["text"]}>是否将此题从错题本移除？</div>
        </Modal>
      ) : null}
      <div className={styles["navheader"]}>
        <div className={styles["top"]}>
          <div className={styles["left-top"]} onClick={() => goBack()}>
            <img className={styles["icon-back"]} src={backIcon} />
            试题错题本
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
      <div className={styles["filter-two-class"]}>
        <FilterExamCategories
          categories={categories}
          defaultKey={cid}
          defaultChild={child}
          scenes={[]}
          scene={""}
          onSelected={(id: number, child: number, sceneId: string) => {
            console.log(id, child);
            setCid(id);
            setChild(child);
            setShowAnswer(false);
            setShowText("对答案");
            setActiveQid(1);
          }}
        ></FilterExamCategories>
      </div>
      <div className={styles["project-box"]}>
        <div className={styles["left-box"]}>
          {qidArr && (
            <NumberSheet
              activeNum={activeQid}
              qidArr={qidArr}
              hasPracticeIds={configkey}
              change={(val: number) => changeQid(val)}
            ></NumberSheet>
          )}
        </div>
        <div className={styles["right-box"]}>
          {question && (
            <>
              {question.type && (
                <div
                  className={styles["delete-icon"]}
                  onClick={() => removeAnswer()}
                >
                  <img src={delIcon} />
                </div>
              )}
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

export default ExamWrongbookPlayPage;
