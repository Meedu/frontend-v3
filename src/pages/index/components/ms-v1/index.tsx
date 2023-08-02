import React from "react";
import styles from "./index.module.scss";
import { ThumbBar } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

interface PropInterface {
  items: any;
  name: string;
}

export const MiaoShaComp: React.FC<PropInterface> = ({ items, name }) => {
  const navigate = useNavigate();
  const goDetail = (item: any) => {
    if (item.is_over || item.over_num === 0) {
      message.error("已结束");
      return;
    }
    if (item.goods_type === "course") {
      navigate("/courses/detail/" + item.goods_id);
    } else if (item.goods_type === "live") {
      navigate("/live/detail/" + item.goods_id);
    } else if (item.goods_type === "book") {
      navigate("/book/detail/" + item.goods_id);
    } else if (item.goods_type === "learnPath") {
      navigate("/learnPath/detail/" + item.goods_id);
    }
  };
  const proWidth = (num: number, overnum: number) => {
    return (((num - overnum) * 90) / num).toFixed(0) + "px";
  };

  return (
    <>
      {items.length > 0 && (
        <div className={styles["index-section-box"]}>
          <div className={styles["index-section-title"]}>
            <div className={styles["index-section-title-text"]}>{name}</div>
          </div>
          <div className={styles["index-section-body"]}>
            {items.map((item: any, index: number) => (
              <div
                className={styles["ms-course-item"]}
                key={item.id + "ms" + index}
                onClick={() => goDetail(item)}
              >
                {!item.goods_type && (
                  <div className={styles["whiteback"]}></div>
                )}
                <div className={styles["ms-course-thumb"]}>
                  {item.goods_type === "book" && (
                    <div className={styles["thumb-bar"]}>
                      <ThumbBar
                        value={item.goods_thumb}
                        width={148.5}
                        height={198}
                        border={8}
                      />
                    </div>
                  )}
                  {item.goods_type !== "book" && (
                    <div className={styles["thumb-bar"]}>
                      <ThumbBar
                        value={item.goods_thumb}
                        width={264}
                        height={198}
                        border={8}
                      />
                    </div>
                  )}
                </div>
                <div className={styles["ms-course-body"]}>
                  <div className={styles["ms-course-title"]}>
                    {item.goods_title}
                  </div>
                  <div className={styles["ms-course-info"]}>
                    <div className={styles["ms-course-charge"]}>
                      <span className={styles["charge-text"]}>
                        <span className={styles["unit"]}>￥</span>
                        {item.charge}
                      </span>
                    </div>
                    <div className={styles["original_charge"]}>
                      原价：{item.original_charge}
                    </div>
                  </div>
                  {(item.is_over || item.over_num === 0) && (
                    <div className={styles["over-progress"]}>已结束</div>
                  )}
                  {!item.is_over && item.over_num !== 0 && (
                    <div className={styles["ms-progress"]}>
                      <div className={styles["label"]}>立即抢购</div>
                      <div className={styles["progress-text"]}>
                        <div className={styles["progress-render"]}>
                          <div
                            className={styles["nowprogress"]}
                            style={{ width: proWidth(item.num, item.over_num) }}
                          ></div>
                        </div>
                        {item.num > 0 && item.over_num > 0 ? (
                          <div className={styles["progress-text-pure"]}>
                            {(
                              ((item.num - item.over_num) * 100) /
                              item.num
                            ).toFixed(0)}
                            %
                          </div>
                        ) : (
                          <div className={styles["progress-text-pure"]}>0%</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
