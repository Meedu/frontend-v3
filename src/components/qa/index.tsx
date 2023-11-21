import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { message, Input, Upload } from "antd";
import type { UploadProps } from "antd";
import { ThumbBar } from "../thumb-bar";
import { QuestionContentRender } from "../question-content-render";
import backIcon from "../../assets/img/icon-back-n.png";
import delIcon from "../../assets/img/icon-delete.png";
import foldIcon from "../../assets/img/exam/fold.png";
import unfoldIcon from "../../assets/img/exam/unfold.png";
import uploadIcon from "../../assets/img/icon-handin.png";
import config from "../../js/config";
import { getToken } from "../../utils/index";

interface PropInterface {
  question: any;
  reply: any;
  thumbs: any;
  isCorrect: number;
  isOver: boolean;
  score: number;
  showImage: boolean;
  wrongBook: boolean;
  num: number;
  update: (id: string, value: string, thumbs: any) => void;
}

export const QaComp: React.FC<PropInterface> = ({
  question,
  reply,
  thumbs,
  isCorrect,
  isOver,
  score,
  showImage,
  wrongBook,
  num,
  update,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [val, setVal] = useState<any>("");
  const [image, setImage] = useState<any>({
    thumb: null,
    index: null,
  });
  const [previewImage, setPreviewImage] = useState<boolean>(false);
  const [thumb, setThumb] = useState<string>("");
  const [prew, setPrew] = useState<boolean>(false);
  const [localThumbs, setLocalThumbs] = useState<any>([]);
  const [remarkStatus, setRemarkStatus] = useState<boolean>(true);
  const [showDelIcon, setShowDelIcon] = useState<boolean>(true);

  useEffect(() => {
    setVal(reply);
    if (thumbs) {
      if (isJson(thumbs)) {
        setLocalThumbs(JSON.parse(thumbs));
      } else {
        setLocalThumbs(thumbs);
      }
    }
  }, [reply, wrongBook, thumbs]);

  const isJson = (str: any) => {
    if (typeof str == "string") {
      try {
        let obj = JSON.parse(str);
        if (typeof obj == "object" && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  };

  const change = (e: any) => {
    if (isOver) {
      return;
    }
    emitCall();
  };

  const emitCall = () => {
    update(question.id, val, localThumbs);
  };

  const deleteImage = () => {
    if (isOver) {
      return;
    }
    let arr = [...localThumbs];
    arr.splice(image.index, 1);
    setLocalThumbs(arr);
    setPreviewImage(false);
    emitCall();
  };

  const PreviewImage = (val: any, index: number) => {
    setPrew(false);
    setImage({
      thumb: val,
      index: index,
    });
    setShowDelIcon(true);
    setPreviewImage(true);
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    method: "POST",
    action: config.app_url + "/api/v2/upload/image",
    headers: {
      Accept: "application/json",
      authorization: "Bearer " + getToken(),
    },
    beforeUpload: (file) => {
      if (localThumbs.length >= 9) {
        message.error("最多上传9张图片");
      }

      const isPNG =
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg";

      if (!isPNG) {
        message.error(`${file.name}不是图片文件`);
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("超过2M限制，不允许上传");
      }
      return (
        (isPNG && isLt2M && !isOver && localThumbs.length < 9) ||
        Upload.LIST_IGNORE
      );
    },
    onChange(info: any) {
      const { status, response } = info.file;
      if (status === "done") {
        if (response.code === 0) {
          let url = response.data.url;
          let arr = localThumbs;
          arr.push(url);
          setLocalThumbs(arr);
          emitCall();
        } else {
          message.error(response.msg);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <div className={styles["choice-item"]}>
      {previewImage && (
        <div className={styles["preview-image"]}>
          <img
            src={backIcon}
            className={styles["back-detail"]}
            onClick={() => setPreviewImage(false)}
          />
          {!isOver && !prew && showDelIcon && (
            <img
              src={delIcon}
              className={styles["delete-img"]}
              onClick={() => deleteImage()}
            />
          )}
          <div className={styles["pic-item"]}>
            <div
              className={styles["pic"]}
              style={{ backgroundImage: "url(" + image.thumb + ")" }}
            ></div>
          </div>
        </div>
      )}
      <div className={styles["info"]}>
        <span className={styles["tit"]}>
          {num}.{question.type_text}（{question.score}分）
        </span>
      </div>
      <div className={styles["question-content"]}>
        <QuestionContentRender
          text={question.content_transform.text}
          images={question.content_transform.images}
          iframes={question.content_transform.iframes}
        ></QuestionContentRender>
      </div>
      <div className={styles["choice-box"]}>
        <div className={styles["input-title"]}>我的作答</div>
        <Input.TextArea
          className={styles["input"]}
          disabled={isOver}
          placeholder="请输入你的答案"
          value={val}
          onBlur={(e) => {
            change(e);
          }}
          onChange={(e) => {
            setVal(e.target.value);
          }}
        ></Input.TextArea>
        {showImage && (localThumbs.length > 0 || !isOver) && (
          <div className={styles["images-box"]}>
            {localThumbs.map((item: any, imageIndex: number) => (
              <div key={imageIndex} className={styles["image-item"]}>
                <div
                  className={styles["image-view"]}
                  onClick={() => PreviewImage(item, imageIndex)}
                >
                  <ThumbBar
                    value={item}
                    width={80}
                    height={80}
                    border={4}
                    isContain
                  ></ThumbBar>
                </div>
              </div>
            ))}
            {!isOver && !wrongBook && (
              <Upload
                className={styles["upload-image-button"]}
                {...props}
                showUploadList={false}
              >
                <img src={uploadIcon} />
              </Upload>
            )}
          </div>
        )}
      </div>
      {isOver &&
        ((wrongBook && question.remark && question.remark !== "") ||
          !wrongBook ||
          (remarkStatus && question.remark && question.remark !== "")) && (
          <div className="analysis-box">
            {wrongBook && question.remark && question.remark !== "" ? (
              <div className="answer-box">
                <div
                  className="button"
                  onClick={() => setRemarkStatus(!remarkStatus)}
                >
                  {remarkStatus && (
                    <>
                      <span>折叠解析</span>
                      <img src={foldIcon} className="icon" />
                    </>
                  )}
                  {!remarkStatus && (
                    <>
                      <span>展开解析</span>
                      <img src={unfoldIcon} className="icon" />
                    </>
                  )}
                </div>
              </div>
            ) : !wrongBook ? (
              <div className="answer-box">
                <div className="content">
                  <div className="score">
                    <i></i>得分：{score}
                  </div>
                </div>
                {question.remark && question.remark !== "" && (
                  <div
                    className="button"
                    onClick={() => setRemarkStatus(!remarkStatus)}
                  >
                    {remarkStatus && (
                      <>
                        <span>折叠解析</span>
                        <img src={foldIcon} className="icon" />
                      </>
                    )}
                    {!remarkStatus && (
                      <>
                        <span>展开解析</span>
                        <img src={unfoldIcon} className="icon" />
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
            {remarkStatus && question.remark && question.remark !== "" && (
              <div className="remark-box">
                <div className="left-remark">
                  <div className="tit">
                    <i></i>解析：
                  </div>
                </div>
                <div className="remark">
                  <QuestionContentRender
                    text={question.remark_transform.text}
                    images={question.remark_transform.images}
                    iframes={question.remark_transform.iframes}
                  ></QuestionContentRender>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};
