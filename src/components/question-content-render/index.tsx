import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { ThumbBar } from "../thumb-bar";
import backIcon from "../../assets/img/icon-back-n.png";
import { latexRender } from "../../utils/index";

interface PropInterface {
  text: any;
  images: any;
  iframes: any;
}

export const QuestionContentRender: React.FC<PropInterface> = ({
  text,
  images,
  iframes,
}) => {
  const [thumb, setThumb] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<boolean>(false);

  useEffect(() => {
    latexRender(document.getElementById("questionCont"));
  }, [document.getElementById("questionCont")]);

  const newPreviewImage = (item: string) => {
    setThumb(item);
    setPreviewImage(true);
  };

  return (
    <>
      {previewImage && (
        <div className={styles["preview-image"]}>
          <img
            src={backIcon}
            className={styles["back-detail"]}
            onClick={() => setPreviewImage(false)}
          />
          <div className={styles["pic-item"]}>
            <div
              className={styles["pic"]}
              style={{ backgroundImage: "url(" + thumb + ")" }}
            ></div>
          </div>
        </div>
      )}
      <div className="content-render" id="questionCont">
        {text}
      </div>
      {(images.length > 0 || iframes.length > 0) && (
        <div className="images-render">
          {images.length > 0 && (
            <>
              {images.map((item: any, index: number) => (
                <div
                  key={index + "thumb"}
                  className="thumb-bar"
                  onClick={() => newPreviewImage(item)}
                >
                  <ThumbBar
                    value={item}
                    width={200}
                    height={200}
                    border={8}
                    isContain
                  ></ThumbBar>
                </div>
              ))}
            </>
          )}
          {iframes.length > 0 && (
            <>
              {iframes.map((iframe: any, index: number) => (
                <div
                  key={index + "iframe"}
                  className="iframe-bar"
                  dangerouslySetInnerHTML={{ __html: iframe }}
                ></div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
};
