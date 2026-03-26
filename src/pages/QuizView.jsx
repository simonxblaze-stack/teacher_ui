import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/apiClient";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import "../styles/quiz-view.css";

const optionLabels = ["a", "b", "c", "d"];

export default function QuizView() {
  const navigate = useNavigate();
  const { quizId, subjectId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await api.get(`/quizzes/${quizId}/`);
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("Failed to load quiz", err);
      }
    }
    fetchQuiz();
  }, [quizId]);

  const getAnswerText = (q) => {
    const answerIndex = optionLabels.indexOf(q.answer?.toLowerCase());
    if (answerIndex >= 0 && q.options?.[answerIndex]) {
      return q.options[answerIndex].text || q.options[answerIndex];
    }
    return q.answer || "";
  };

  const toggleReveal = (idx) =>
    setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }));

  if (!quiz) {
    return <div className="qv-loading">Loading quiz...</div>;
  }

  const filtered = questions.filter((q) =>
    (q.text || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="quiz-view-page">
      <button className="qv-back-btn" onClick={() => navigate(-1)}>
        <IoChevronBack /> Back
      </button>

      <div className="qv-header">
        <h2 className="qv-title">{quiz.subject_name || "Subject"}</h2>
        <div className="qv-search">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="qv-search-icon" />
        </div>
      </div>

      <div className="qv-content-card">
        <div className="qv-edit-row">
          <button
            className="qv-edit-btn"
            onClick={() => navigate("/teacher/classes/quizzes/create", { state: quiz })}
          >
            Edit
          </button>
        </div>

        <div className="qv-details">
          <h3 className="qv-quiz-title">Quiz ({quiz.title || "ID"})</h3>

          <p className="qv-teacher-info">
            {quiz.teacher_name || quiz.created_by_email} -{" "}
            {quiz.created_at
              ? new Date(quiz.created_at).toLocaleDateString()
              : "-"}
          </p>

          <div className="qv-dates-row">
            <span className="qv-date-text">
              Due Date:{" "}
              {quiz.due_date
                ? new Date(quiz.due_date).toLocaleDateString()
                : "-"}
            </span>
            <span className="qv-question-count">
              {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="qv-questions-list">
            {filtered.length === 0 && (
              <p className="qv-no-results">No questions found.</p>
            )}

            {filtered.map((q, qIndex) => {
              const answerText = getAnswerText(q);
              const isOpen = !!revealed[qIndex];

              return (
                <div className="qv-question-block" key={qIndex}>
                  <div className="qv-question-row">
                    <span className="qv-question-text">
                      <span className="qv-q-num">{qIndex + 1}.</span>
                      {q.text || "Question"}
                    </span>
                    <button
                      className={`qv-ans-toggle ${isOpen ? "open" : ""}`}
                      onClick={() => toggleReveal(qIndex)}
                    >
                      {isOpen ? "Hide answer" : "Show answer"}
                    </button>
                  </div>

                  <div className="qv-options-row">
                    {(q.options || q.choices || []).map((opt, optIndex) => {
                      const optText = opt.text || opt;
                      const isAnswer = optText === answerText;
                      return (
                        <label
                          className={`qv-option ${isOpen && isAnswer ? "qv-option-answer" : ""}`}
                          key={optIndex}
                        >
                          <input type="radio" disabled />
                          <span>{optText}</span>
                          {isOpen && isAnswer && (
                            <IoCheckmarkCircle className="qv-check-icon" />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {isOpen && answerText && (
                    <div className="qv-answer-pill">
                      <IoCheckmarkCircle />
                      <span>Correct answer: <strong>{answerText}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="qv-actions">
            <button
              className="qv-view-submission-btn"
              onClick={() =>
                navigate(`/teacher/classes/${subjectId}/quizzes/${quizId}/submissions`)
              }
            >
              View Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}