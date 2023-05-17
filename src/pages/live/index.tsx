import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Row, Col, Skeleton, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { live } from "../../api/index";
import { Empty, LiveCourseItem, FilterCategories } from "../../components";

export const LivePage = () => {
  document.title = "直播课";
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(16);
  const [total, setTotal] = useState(0);
  const result = new URLSearchParams(useLocation().search);
  const [cid, setCid] = useState(Number(result.get("cid")) || 0);
  const [child, setChild] = useState(Number(result.get("child")) || 0);

  useEffect(() => {
    getList();
  }, [refresh, page, size]);

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
    let category_id = 0;
    if (child === 0 || cid == 0) {
      category_id = cid;
    } else {
      category_id = child;
    }
    live
      .list({
        page: page,
        size: size,
        cid: category_id,
      })
      .then((res: any) => {
        setList(res.data.data.data);
        setTotal(res.data.data.total);
        setCategories(res.data.categories);
        setLoading(false);
      });
  };

  return (
    <>
      <FilterCategories
        loading={loading}
        categories={categories}
        defaultKey={cid}
        defaultChild={child}
        onSelected={(id: number, child: number) => {
          setCid(id);
          setChild(child);
          if (id === 0) {
            navigate("/live");
          } else {
            navigate("/live?cid=" + cid + "&child=" + child);
          }
          resetList();
        }}
      />
      <div className="container">
        {loading && (
          <Row style={{ width: 1200 }}>
            <div
              style={{
                width: 1200,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginTop: 30,
              }}
            >
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 30,
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 30,
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 30,
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
              <div
                style={{
                  width: 264,
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 30,
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 264,
                    height: 198,
                    borderRadius: "8px 8px 0 0",
                  }}
                ></Skeleton.Button>
                <Skeleton active paragraph={{ rows: 1 }}></Skeleton>
              </div>
            </div>
          </Row>
        )}
        {!loading && list.length === 0 && (
          <Col span={24}>
            <Empty></Empty>
          </Col>
        )}
        {!loading && list.length > 0 && (
          <div className={styles["list-box"]}>
            {list.map((item: any) => (
              <LiveCourseItem
                key={item.id}
                cid={item.id}
                thumb={item.thumb}
                category={item.category}
                title={item.title}
                charge={item.charge}
              ></LiveCourseItem>
            ))}
          </div>
        )}
        {!loading && list.length > 0 && size < total && (
          <Col
            span={24}
            style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
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
    </>
  );
};
