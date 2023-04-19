import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Row, Col, Modal, Spin, Button, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { path } from "../../api/index";
import { Empty, LearnPathCourseItem, FilterCategories } from "../../components";

export const LearnPathPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(16);
  const [total, setTotal] = useState(0);
  const [steps, setSteps] = useState<any>([]);
  const result = new URLSearchParams(useLocation().search);
  const [cid, setCid] = useState(Number(result.get("cid")) || 0);
  const [child, setChild] = useState(Number(result.get("child")) || 0);

  useEffect(() => {
    getParams();
  }, []);

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
    if (child === 0) {
      category_id = cid;
    } else {
      category_id = child;
    }
    path
      .list({
        page: page,
        size: size,
        category_id: category_id,
      })
      .then((res: any) => {
        setList(res.data.data.data);
        setSteps(res.data.steps);
        setTotal(res.data.data.total);

        setLoading(false);
      });
  };

  const getParams = () => {
    path.create({}).then((res: any) => {
      setCategories(res.data);
    });
  };

  const stepsCount = (item: any) => {
    let id = item.id;
    if (typeof steps[id] === "undefined") {
      return 0;
    }
    return steps[id].length;
  };

  return (
    <>
      <FilterCategories
        categories={categories}
        defaultKey={cid}
        defaultChild={child}
        onSelected={(id: number, child: number) => {
          setCid(id);
          setChild(id);
          if (id === 0) {
            navigate("/learnPath");
          } else {
            navigate("/learnPath?cid=" + cid + "&child=" + child);
          }
          resetList();
        }}
      />
      <div className="container">
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
              <LearnPathCourseItem
                key={item.id}
                cid={item.id}
                thumb={item.thumb}
                desc={item.desc}
                name={item.name}
                coursesCount={item.courses_count}
                stepsCount={stepsCount(item)}
                charge={item.charge}
                originalCharge={item.original_charge}
              ></LearnPathCourseItem>
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