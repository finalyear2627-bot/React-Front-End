import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { lmsService } from "../api/lms.service";
import { getApiError } from "../utils/toast";
import "../assets/css/study-mate.css";

const toList = (value) => Array.isArray(value) ? value : value?.results || value?.result || [];

const starters = [
  "Explain object-oriented programming with a simple example",
  "Help me make a study plan for my assignment",
  "What is the difference between a class and an object?",
  "Teach me web development basics step by step",
];

const renderInline = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
  part.startsWith("**") && part.endsWith("**")
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part
);

const ReplyText = ({ text }) => <div className="study-mate-reply">{text.split("\n").map((line, index) =>
  line.trim() ? <p key={index}>{renderInline(line)}</p> : <span key={index} className="study-mate-line-break" />
)}</div>;

export default function StudyMate() {
  const welcome = useMemo(() => ({
    role: "assistant",
    text: "Assalam-o-alaikum! I’m StudyMate. Choose a course if you like, then ask me anything. I’ll explain it clearly, one step at a time.",
  }), []);
  const [messages, setMessages] = useState([welcome]);
  const [draft, setDraft] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    lmsService.getStudentCourses()
      .then((data) => setCourses(toList(data)))
      .catch(() => setCourses([]))
      .finally(() => setCourseLoading(false));
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, loading]);

  const sendMessage = async (value) => {
    const text = value.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setDraft("");
    setError("");
    setLoading(true);
    try {
      const response = await lmsService.askStudyBot(text, courseId || undefined);
      const answer = response.answer || response.message || response.response;
      if (!answer) throw new Error("StudyMate did not return a reply.");
      setMessages([...next, { role: "assistant", text: answer }]);
    } catch (requestError) {
      const errorMessage = getApiError(requestError);
      setError(errorMessage);
      setMessages([...next, {
        role: "assistant",
        text: errorMessage,
        failed: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((item) => String(item.course?.id || item.course_id || item.id) === String(courseId));
  const selectedName = selectedCourse?.course?.name || selectedCourse?.name || "All study topics";

  return <main className="study-mate-shell">
    <header className="study-mate-hero">
      <div className="study-mate-orb"><Icon icon="solar:stars-line-duotone" /></div>
      <div className="study-mate-title">
        <div className="study-mate-kicker"><span /> AI LEARNING COMPANION</div>
        <h1>StudyMate</h1>
        <p>Clear explanations, thoughtful examples, and help that keeps you learning.</p>
      </div>
      <div className="study-mate-online"><span /> Online</div>
    </header>

    <div className="study-mate-toolbar">
      <div className="study-mate-course">
        <Icon icon="solar:book-bookmark-linear" />
        <label htmlFor="study-course">Study context</label>
        <select id="study-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={courseLoading || loading}>
          <option value="">All study topics</option>
          {courses.map((item) => {
            const course = item.course || item;
            const id = course.id || item.course_id || item.id;
            return <option key={id} value={id}>{course.code ? `${course.code} — ` : ""}{course.name || "Course"}</option>;
          })}
        </select>
      </div>
      <span className="study-mate-context">{courseLoading ? "Loading your courses…" : selectedName}</span>
    </div>

    <section className="study-mate-chat" aria-live="polite">
      {messages.map((message, index) => <article key={`${message.role}-${index}`} className={`study-mate-message ${message.role === "user" ? "is-user" : "is-bot"}`}>
        <div className="study-mate-avatar">{message.role === "user" ? <Icon icon="solar:user-rounded-bold" /> : <Icon icon="solar:stars-line-duotone" />}</div>
        <div className="study-mate-message-content">
          <span className="study-mate-sender">{message.role === "user" ? "You" : "StudyMate"}</span>
          <div className={`study-mate-bubble ${message.failed ? "is-failed" : ""}`}><ReplyText text={message.text} /></div>
        </div>
      </article>)}
      {loading && <article className="study-mate-message is-bot">
        <div className="study-mate-avatar"><Icon icon="solar:stars-line-duotone" /></div>
        <div className="study-mate-message-content"><span className="study-mate-sender">StudyMate is thinking</span><div className="study-mate-bubble study-mate-thinking"><i /><i /><i /></div></div>
      </article>}
      <div ref={chatEndRef} />
    </section>

    {messages.length === 1 && <section className="study-mate-prompts">
      <div><span>Not sure where to start?</span><strong>Try one of these</strong></div>
      <div className="study-mate-prompt-list">{starters.map((prompt) => <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}><span>{prompt}</span><Icon icon="solar:arrow-right-up-linear" /></button>)}</div>
    </section>}

    {error && <aside className="study-mate-notice"><Icon icon="solar:info-circle-linear" /><span>{error}</span><button type="button" onClick={() => sendMessage(messages.at(-2)?.text || "")}>Try again</button></aside>}

    <form onSubmit={(event) => { event.preventDefault(); sendMessage(draft); }} className="study-mate-composer">
      <div className="study-mate-input-wrap"><Icon icon="solar:pen-new-square-linear" /><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask StudyMate a question…" maxLength="4000" aria-label="Your question for StudyMate" disabled={loading} /></div>
      <button type="submit" disabled={loading || !draft.trim()}>{loading ? "Thinking…" : "Send"}<Icon icon="solar:plain-2-bold" /></button>
    </form>
    <p className="study-mate-disclaimer"><Icon icon="solar:shield-check-linear" /> StudyMate helps you learn. Verify graded work and important course decisions with your instructor.</p>
  </main>;
}
