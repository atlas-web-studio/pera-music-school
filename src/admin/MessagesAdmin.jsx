import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { getAdminApiErrorMessage } from "./adminApiError.js";

const inboxConfigs = {
  work: {
    route: "/admin/messages",
    tabLabel: "Work Applications",
    loadError: "Applications could not be loaded.",
    updateError: "Application status could not be updated.",
    deleteError: "Applications could not be deleted.",
    loadingLabel: "Loading applications...",
    emptyLabel: "No applications found.",
    detailEmptyLabel: "Select an application to view details.",
    searchPlaceholder: "Search name, email, instrument...",
    fetchUrl: "/api/work-applications",
    statusUrl: (id) => `/api/work-applications/${id}/status`,
    deleteUrl: (id) => `/api/work-applications/${id}`,
    rowClassName: "work-app",
    columns: ["Status", "Name", "Email", "Instrument", "Date"],
    getSearchText: (item) =>
      `${item.fullName} ${item.email} ${item.phone} ${item.instruments?.join(" ")}`.toLowerCase(),
    getRowValues: (item, formatDate) => [
      item.fullName,
      item.email,
      item.instruments?.join(", "),
      formatDate(item.createdAt),
    ],
  },
  trial: {
    route: "/admin/trial-sessions",
    tabLabel: "Trial Sessions Requests",
    loadError: "Trial session requests could not be loaded.",
    updateError: "Trial session request status could not be updated.",
    deleteError: "Trial session requests could not be deleted.",
    loadingLabel: "Loading trial session requests...",
    emptyLabel: "No trial session requests found.",
    detailEmptyLabel: "Select a trial session request to view details.",
    searchPlaceholder: "Search student, parent, email, instrument...",
    fetchUrl: "/api/trial-sessions",
    statusUrl: (id) => `/api/trial-sessions/${id}/status`,
    deleteUrl: (id) => `/api/trial-sessions/${id}`,
    rowClassName: "trial-session",
    columns: ["Status", "Student", "Instrument", "Email", "Date"],
    getSearchText: (item) =>
      `${item.studentName} ${item.parentName} ${item.email} ${item.phone} ${
        item.instrument || ""
      } ${item.teacher || ""} ${item.school || ""} ${
        item.participation?.join(" ") || ""
      } ${item.programInterests?.join(" ") || ""} ${item.experienceLevel || ""} ${
        item.availability || ""
      }`.toLowerCase(),
    getRowValues: (item, formatDate) => [
      item.studentName,
      item.instrument || item.programInterests?.join(", "),
      item.email,
      formatDate(item.createdAt),
    ],
  },
};

function renderWorkDetails(item, formatDate, updateStatus, deleteItems) {
  return (
    <>
      <div className="admin-detail-heading">
        <div>
          <p className="admin-eyebrow">Teaching Inquiry</p>
          <h2>{item.fullName}</h2>
        </div>

        <span
          className={
            item.status === "NEW" ? "admin-badge success" : "admin-badge muted"
          }
        >
          {item.status}
        </span>
      </div>

      <div className="admin-detail-info">
        <p>
          <strong>Email:</strong> {item.email}
        </p>
        <p>
          <strong>Phone:</strong> {item.phone}
        </p>
        <p>
          <strong>Received:</strong> {formatDate(item.createdAt)}
        </p>
      </div>

      <div className="admin-detail-message">
        <h3>Instruments</h3>
        <div className="admin-instrument-tags">
          {item.instruments?.map((instrument) => (
            <span key={instrument}>{instrument}</span>
          ))}
        </div>
      </div>

      <div className="admin-actions">
        <button onClick={() => updateStatus([item._id], "READ")}>Mark Read</button>
        <button onClick={() => updateStatus([item._id], "ARCHIVED")}>
          Archive
        </button>
        <button className="danger" onClick={() => deleteItems([item._id])}>
          Delete
        </button>
      </div>
    </>
  );
}

function renderDetailField(label, value) {
  return value ? (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  ) : null;
}

function renderDetailList(label, values) {
  return Array.isArray(values) && values.length > 0 ? (
    <div className="admin-detail-list">
      <strong>{label}</strong>

      <ul>
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  ) : null;
}

function renderTrialDetails(item, formatDate, updateStatus, deleteItems) {
  const participationItems =
    Array.isArray(item.participation) && item.participation.length > 0
      ? item.participation
      : Array.isArray(item.programInterests)
      ? item.programInterests
      : [];

  return (
    <>
      <div className="admin-detail-heading">
        <div>
          <p className="admin-eyebrow">Trial Request</p>
          <h2>{item.studentName}</h2>
        </div>

        <span
          className={
            item.status === "NEW" ? "admin-badge success" : "admin-badge muted"
          }
        >
          {item.status}
        </span>
      </div>

      <div className="admin-detail-info">
        {renderDetailField("Date of birth", item.dateOfBirth)}
        {renderDetailField("Age", item.studentAge)}
        {renderDetailField("Grade", item.grade)}
        {renderDetailField("School", item.school)}
        {renderDetailField("Parent / Guardian", item.parentName)}
        {renderDetailField("Email", item.email)}
        {renderDetailField("Phone", item.phone)}
        {renderDetailField("Address", item.address)}
        {renderDetailField("Received", formatDate(item.createdAt))}
      </div>

      {item.trialDate || item.teacher || item.instrument || item.lessonLength || item.lessonTime ? (
        <div className="admin-detail-message">
          <h3>Trial lesson information</h3>
          {renderDetailField("Date", item.trialDate)}
          {renderDetailField("Teacher", item.teacher)}
          {renderDetailField("Instrument", item.instrument)}
          {renderDetailField("Lesson length", item.lessonLength)}
          {renderDetailField("Time", item.lessonTime)}
        </div>
      ) : null}

      {item.hasPreviousLessons ||
      item.previousInstruments ||
      item.previousLessonYears ||
      item.previousTeacherSchool ||
      item.musicReadingLevel ||
      item.practicesAnotherInstrument ||
      participationItems.length > 0 ? (
        <div className="admin-detail-message">
          <h3>Student background</h3>
          {renderDetailField("Taken music lessons before", item.hasPreviousLessons)}
          {renderDetailField("Previous instrument(s)", item.previousInstruments)}
          {renderDetailField("How many years", item.previousLessonYears)}
          {renderDetailField("Previous teacher/school", item.previousTeacherSchool)}
          {renderDetailField("Can read music", item.musicReadingLevel)}
          {renderDetailField(
            "Practices another instrument",
            item.practicesAnotherInstrument
          )}
          {renderDetailList("Participation interests", participationItems)}
        </div>
      ) : null}

      {item.experienceLevel || item.availability || item.goals ? (
        <div className="admin-detail-message">
          <h3>Legacy form details</h3>
          {renderDetailField("Experience", item.experienceLevel)}
          {renderDetailField("Availability", item.availability)}
          {renderDetailField("Goals / notes", item.goals)}
        </div>
      ) : null}

      <div className="admin-actions">
        <button onClick={() => updateStatus([item._id], "READ")}>Mark Read</button>
        <button onClick={() => updateStatus([item._id], "ARCHIVED")}>
          Archive
        </button>
        <button className="danger" onClick={() => deleteItems([item._id])}>
          Delete
        </button>
      </div>
    </>
  );
}

export default function MessagesAdmin({ inboxType = "work" }) {
  const config = inboxConfigs[inboxType] || inboxConfigs.work;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setLoadError("");
      setActionError("");
      setCheckedIds([]);
      setSelectedId(null);

      try {
        const res = await api.get(config.fetchUrl);
        setItems(res.data);
        setSelectedId(res.data[0]?._id || null);
      } catch (err) {
        console.error(err);
        setLoadError(getAdminApiErrorMessage(err, config.loadError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [config]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter = filter === "ALL" || item.status === filter;
      return matchesFilter && config.getSearchText(item).includes(search.toLowerCase());
    });
  }, [items, filter, search, config]);

  const selectedItem =
    items.find((item) => item._id === selectedId) || filteredItems[0];

  const counts = {
    NEW: items.filter((item) => item.status === "NEW").length,
    READ: items.filter((item) => item.status === "READ").length,
    ARCHIVED: items.filter((item) => item.status === "ARCHIVED").length,
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const toggleChecked = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (checkedIds.length === filteredItems.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredItems.map((item) => item._id));
    }
  };

  const updateStatus = async (ids, status) => {
    const targetIds =
      ids.length > 0 ? ids : selectedItem ? [selectedItem._id] : [];

    setActionError("");

    try {
      const updatedItems = await Promise.all(
        targetIds.map((id) => api.patch(config.statusUrl(id), { status }))
      );

      setItems((prev) =>
        prev.map((item) => {
          const updated = updatedItems.find((res) => res.data._id === item._id);
          return updated ? updated.data : item;
        })
      );

      setCheckedIds([]);
    } catch (err) {
      console.error(err);
      setActionError(getAdminApiErrorMessage(err, config.updateError));
    }
  };

  const deleteItems = async (ids) => {
    const targetIds =
      ids.length > 0 ? ids : selectedItem ? [selectedItem._id] : [];

    setActionError("");

    try {
      await Promise.all(targetIds.map((id) => api.delete(config.deleteUrl(id))));

      setItems((prev) => prev.filter((item) => !targetIds.includes(item._id)));
      setCheckedIds([]);

      if (selectedItem && targetIds.includes(selectedItem._id)) {
        const remaining = items.filter((item) => !targetIds.includes(item._id));
        setSelectedId(remaining[0]?._id || null);
      }
    } catch (err) {
      console.error(err);
      setActionError(getAdminApiErrorMessage(err, config.deleteError));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Inbox</p>
          <h1 className="admin-title">Messages</h1>
          <p className="admin-subtitle">
            Switch between trial requests and teaching inquiries submitted through
            the public website.
          </p>
        </div>
      </div>

      <div className="admin-tabs">
        {Object.entries(inboxConfigs).map(([key, itemConfig]) => (
          <Link
            key={itemConfig.route}
            to={itemConfig.route}
            className={key === inboxType ? "active" : undefined}
          >
            {itemConfig.tabLabel}
          </Link>
        ))}
      </div>

      {loadError ? <div className="admin-system-alert">{loadError}</div> : null}
      {actionError ? <div className="admin-system-alert">{actionError}</div> : null}

      <div className="admin-inbox-counts">
        <button
          className={filter === "NEW" ? "active" : undefined}
          onClick={() => setFilter("NEW")}
        >
          NEW {counts.NEW}
        </button>
        <button
          className={filter === "READ" ? "active" : undefined}
          onClick={() => setFilter("READ")}
        >
          READ {counts.READ}
        </button>
        <button
          className={filter === "ARCHIVED" ? "active" : undefined}
          onClick={() => setFilter("ARCHIVED")}
        >
          ARCHIVED {counts.ARCHIVED}
        </button>
      </div>

      <div className="admin-inbox-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={config.searchPlaceholder}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <div className="admin-inbox-actions">
          <button
            onClick={() => updateStatus(checkedIds, "READ")}
            disabled={isLoading || Boolean(loadError)}
          >
            Mark Read
          </button>
          <button
            onClick={() => updateStatus(checkedIds, "NEW")}
            disabled={isLoading || Boolean(loadError)}
          >
            Mark New
          </button>
          <button
            onClick={() => updateStatus(checkedIds, "ARCHIVED")}
            disabled={isLoading || Boolean(loadError)}
          >
            Archive
          </button>
          <button
            className="danger"
            onClick={() => deleteItems(checkedIds)}
            disabled={isLoading || Boolean(loadError)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="admin-inbox-shell">
        <section className="admin-inbox-table-card">
          <div className={`admin-inbox-table-head ${config.rowClassName}-head`}>
            <input
              type="checkbox"
              checked={
                filteredItems.length > 0 && checkedIds.length === filteredItems.length
              }
              onChange={toggleAll}
            />
            {config.columns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>

          {isLoading ? (
            <div className="admin-empty-state">{config.loadingLabel}</div>
          ) : filteredItems.length === 0 ? (
            <div className="admin-empty-state">
              {loadError || config.emptyLabel}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className={`admin-inbox-table-row ${config.rowClassName}-row ${
                  selectedItem?._id === item._id ? "active" : ""
                }`}
                onClick={() => setSelectedId(item._id)}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.includes(item._id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleChecked(item._id);
                  }}
                />

                <span
                  className={
                    item.status === "NEW"
                      ? "admin-badge success"
                      : "admin-badge muted"
                  }
                >
                  {item.status}
                </span>

                {config.getRowValues(item, formatDate).map((value, index) => (
                  <span key={`${item._id}-${index}`}>{value}</span>
                ))}
              </div>
            ))
          )}
        </section>

        <aside className="admin-inbox-detail-card">
          {selectedItem ? (
            inboxType === "trial"
              ? renderTrialDetails(selectedItem, formatDate, updateStatus, deleteItems)
              : renderWorkDetails(selectedItem, formatDate, updateStatus, deleteItems)
          ) : (
            <div className="admin-empty-state">
              {loadError || config.detailEmptyLabel}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
