import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import api from "../api/apiClient";
import "../styles/quiz-review-view.css";

export default function QuizReviewView() {
  const navigate = useNavigate();
  const { attemptId } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const res = await api.get(`/teacher/attempts/${attemptId}/`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load review", err);
      }
    }

    fetchReview();
  }, [attemptId]);

  if (!data) {
    return <div style={{ padding: "40px" }}>Loading review...</div>;
  }

  return (
    <div className="qrv-page">
      <button className="qrv-back-btn" onClick={() => navigate(-1)}>
        <IoChevronBack /> Back
      </button>

      <div className="qrv-card">
        <div className="qrv-header">
          <h2 className="qrv-title">Quiz Review</h2>
          <div className="qrv-search">
            <input type="text" placeholder="Search" />
            <FiSearch className="qrv-search-icon" />
          </div>
        </div>

        <div className="qrv-content">
          <h3 className="qrv-student-name">{data.student_name}</h3>

          <div className="qrv-dates-row">
            <span className="qrv-date-text">
              Submitted:{" "}
              {data.submitted_at
                ? new Date(data.submitted_at).toLocaleString()
                : "-"}
            </span>
          </div>

          <div className="qrv-questions-list">
            {data.questions.map((q, qIndex) => (
              <div className="qrv-question-block" key={qIndex}>
                <div className="qrv-question-text">
                  {qIndex + 1}. {q.question}
                </div>

                <div className="qrv-options-answer-row">
                  <div className="qrv-options-row">
                    {q.options.map((opt, optIndex) => (
                      <label className="qrv-option" key={optIndex}>
                        <input
                          type="radio"
                          checked={opt === q.selected}
                          disabled
                          readOnly
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <span className="qrv-answer-tag">
                    Ans: {q.correct}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="qrv-score">
            Score: {data.score}/{data.total}
          </div>
        </div>
      </div>
    </div>
  );
}
