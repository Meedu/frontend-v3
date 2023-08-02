import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Row, Col, Skeleton, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { book } from "../../api/index";
import {
  Empty,
  FilterCategories,
  BookCourseItem,
  ThumbBar,
} from "../../components";

const BookPage = () => {
  document.title = "电子书";
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [hotList, setHotList] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const result = new URLSearchParams(useLocation().search);
  const [cid, setCid] = useState(Number(result.get("category_id")) || 0);

  useEffect(() => {
    getList();
  }, [refresh, page, size]);

  useEffect(() => {
    getHotData();
  }, []);

  const resetList = () => {
    setPage(1);
    setList([]);
    setRefresh(!refresh);
  };

  const getList = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    book
      .list({
        page: page,
        size: size,
        scene: "default",
        cid: cid,
      })
      .then((res: any) => {
        setList(res.data.data.data);
        setTotal(res.data.data.total);
        setCategories(res.data.categories);
        setLoading(false);
      });
  };

  const getHotData = () => {
    if (loading2) {
      return;
    }
    setLoading2(true);
    book.hotList().then((res: any) => {
      setHotList(res.data);
      setLoading2(false);
    });
  };

  const goDetail = (id: number) => {
    navigate("/book/detail/" + id);
  };

  return (
    <>
      <FilterCategories
        loading={loading}
        categories={categories}
        defaultKey={cid}
        defaultChild={0}
        onSelected={(id: number, child: number) => {
          setCid(id);
          if (id === 0) {
            navigate("/book");
          } else {
            navigate("/book?category_id=" + id);
          }
          resetList();
        }}
      />
      <div className={styles["contanier"]}>
        <div className={styles["left-contanier"]}>
          {loading && (
            <Row>
              <div
                style={{
                  width: 769,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 769,
                      display: "flex",
                      flexDirection: "row",
                      padding: "20px 30px",
                      marginBottom: 10,
                      boxSizing: "border-box",
                    }}
                  >
                    <Skeleton.Button
                      active
                      style={{
                        width: 120,
                        height: 160,
                        borderRadius: 8,
                        marginRight: 20,
                      }}
                    ></Skeleton.Button>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "left",
                      }}
                    >
                      <Skeleton.Button
                        active
                        style={{
                          width: 569,
                          height: 20,
                          marginTop: 20,
                        }}
                      ></Skeleton.Button>
                      <Skeleton.Button
                        active
                        style={{
                          width: 569,
                          height: 20,
                          marginTop: 20,
                        }}
                      ></Skeleton.Button>
                      <Skeleton.Button
                        active
                        style={{
                          width: 100,
                          height: 25,
                          marginTop: 56,
                        }}
                      ></Skeleton.Button>
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          )}
          {!loading && list.length === 0 && (
            <Col span={24}>
              <Empty></Empty>
            </Col>
          )}
          {!loading &&
            list.length > 0 &&
            list.map((item: any) => (
              <div className={styles["book-item"]} key={item.id}>
                <BookCourseItem
                  cid={item.id}
                  thumb={item.thumb}
                  viewTimes={item.view_times}
                  name={item.name}
                  charge={item.charge}
                  isVipFree={item.is_vip_free}
                  userCount={item.user_count}
                  shortDesc={item.short_desc}
                  publishedAt={item.published_at}
                ></BookCourseItem>
              </div>
            ))}
          {!loading && list.length > 0 && size < total && (
            <Col
              span={24}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <Pagination
                onChange={(currentPage) => {
                  setPage(currentPage);
                  window.scrollTo(0, 0);
                }}
                pageSize={size}
                defaultCurrent={page}
                total={total}
              />
            </Col>
          )}
        </div>
        <div className={styles["right-contanier"]}>
          <div className={styles["right-list"]}>
            <div className={styles["tit"]}>推荐阅读</div>
            {loading2 && (
              <Row>
                <div
                  style={{
                    width: 400,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 400,
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: 30,
                      }}
                    >
                      <Skeleton.Button
                        active
                        style={{
                          width: 90,
                          height: 120,
                          borderRadius: 8,
                          marginRight: 20,
                        }}
                      ></Skeleton.Button>
                      <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
                    </div>
                  ))}
                </div>
              </Row>
            )}
            {!loading2 && hotList.length === 0 && (
              <Col span={24}>
                <Empty></Empty>
              </Col>
            )}
            {!loading2 && hotList.length > 0 && (
              <div className={styles["right-box"]}>
                {hotList.map((item: any) => (
                  <div key={item.id} className={styles["book-item"]}>
                    <div
                      className={styles["book-item-comp"]}
                      onClick={() => goDetail(item.id)}
                    >
                      <div className={styles["book-thumb"]}>
                        <div className={styles["thumb-bar"]}>
                          <ThumbBar
                            value={item.thumb}
                            width={90}
                            height={120}
                            border={null}
                          />
                        </div>
                      </div>
                      <div className={styles["book-body"]}>
                        <div className={styles["book-title"]}>{item.name}</div>
                        <div className={styles["book-charge"]}>
                          {item.charge !== 0 && (
                            <div className={styles["charge-text"]}>
                              <span className={styles["unit"]}>￥</span>
                              {item.charge}
                            </div>
                          )}
                          {item.charge === 0 && (
                            <div className={styles["free-text"]}>免费</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookPage;
