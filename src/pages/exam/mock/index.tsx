import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Row, Col, Spin, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { mock } from "../../../api/index";
import { Empty, MockCourseItem, FilterCategories } from "../../../components";

export const ExamMockPaperPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any>([]);
  const [userpapers, setUserpapers] = useState<any>([]);
  const result = new URLSearchParams(useLocation().search);
  const [cid, setCid] = useState(Number(result.get("cid")) || 0);
  const [child, setChild] = useState(Number(result.get("child")) || 0);

  useEffect(() => {
    getList();
  }, [page, size, refresh]);

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
    mock
      .list({
        page: page,
        page_size: size,
        cid1: cid,
        cid2: child,
      })
      .then((res: any) => {
        let categoriesData: any = [];
        res.data.categories.forEach((item: any) => {
          let categoryItem: any = {
            id: item.id,
            name: item.name,
            children: [],
          };
          if (typeof res.data.category_children[item.id] !== "undefined") {
            categoryItem["children"].push(
              ...res.data.category_children[item.id]
            );
          }
          categoriesData.push(categoryItem);
        });
        setList(res.data.data.data);
        setTotal(res.data.data.total);
        setCategories(categoriesData);
        let papers = res.data.user_papers;
        if (papers) {
          const data = [...userpapers];
          let newData = Object.assign(data, papers);
          setUserpapers(newData);
        }
        setLoading(false);
      });
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
        /<span>模拟考试</span>
      </div>
      <div className={styles["content"]}>
        <div className={styles["filter-two-class"]}>
          <FilterCategories
            categories={categories}
            defaultKey={cid}
            defaultChild={child}
            onSelected={(id: number, child: number) => {
              setCid(id);
              setChild(child);
              resetList();
            }}
          />
        </div>
        {loading && (
          <Row style={{ width: 1200 }}>
            <div className="float-left d-j-flex mt-50">
              <Spin size="large" />
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
              <MockCourseItem
                key={item.id}
                cid={item.id}
                title={item.title}
                charge={item.charge}
                records={userpapers}
                isFree={item.cur_user_can_join}
                expiredMinutes={item.expired_minutes}
                questionsCount={item.questions_count}
              ></MockCourseItem>
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
    </div>
  );
};