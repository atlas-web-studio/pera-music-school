import { useState, useEffect } from "react";
import api from "../api/api";
import { getAdminApiErrorMessage } from "./adminApiError.js";
import { sortTeachers } from "../utils/content.js";

const emptyTeacher = {
  name: "",
  role: "",
  imageUrl: "",
  imageFile: null,
  bio: "",
};

export default function TeachersAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const res = await api.get("/api/teachers");
        setTeachers(sortTeachers(res.data));
      } catch (err) {
        console.error(err);
        setLoadError(
          getAdminApiErrorMessage(err, "Teachers could not be loaded.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const openAddForm = () => {
    setActionError("");
    setEditingTeacher(emptyTeacher);
    setMode("add");
  };

  const openEditForm = (teacher) => {
    setActionError("");
    setEditingTeacher({
      ...teacher,
      imageUrl: teacher.imageUrl || "",
      imageFile: null,
    });
    setMode("edit");
  };

  const handleChange = (field, value) => {
    setEditingTeacher((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setEditingTeacher((prev) => ({
      ...prev,
      imageUrl: previewUrl,
      imageFile: file,
    }));
  };

  const handleSave = async () => {
    setActionError("");

    try {
      const formData = new FormData();

      formData.append("name", editingTeacher.name);
      formData.append("role", editingTeacher.role);
      formData.append("bio", editingTeacher.bio);

      if (editingTeacher.imageFile) {
        formData.append("image", editingTeacher.imageFile);
      }

      if (mode === "add") {
        const res = await api.post("/api/teachers", formData);

        setTeachers((prev) => sortTeachers([...prev, res.data]));
      }

      if (mode === "edit") {
        formData.append("order", editingTeacher.order ?? 0);

        const res = await api.put(`/api/teachers/${editingTeacher._id}`, formData);

        setTeachers((prev) =>
          sortTeachers(
            prev.map((teacher) =>
              teacher._id === editingTeacher._id ? res.data : teacher
            )
          )
        );
      }

      setEditingTeacher(null);
      setMode(null);
    } catch (err) {
      console.error(err);
      setActionError(
        getAdminApiErrorMessage(err, "Teacher changes could not be saved.")
      );
    }
  };

  const deleteTeacher = async (id) => {
    setActionError("");

    try {
      await api.delete(`/api/teachers/${id}`);
      setTeachers((prev) => prev.filter((teacher) => teacher._id !== id));
    } catch (err) {
      console.error(err);
      setActionError(
        getAdminApiErrorMessage(err, "Teacher could not be deleted.")
      );
    }
  };

  const closeForm = () => {
    setEditingTeacher(null);
    setMode(null);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Content Management</p>
          <h1 className="admin-title">Teachers</h1>
          <p className="admin-subtitle">
            Add, edit, and manage teacher profiles displayed on the website.
          </p>
        </div>

        <button
          className="admin-button"
          onClick={openAddForm}
          disabled={Boolean(loadError)}
        >
          + Add Teacher
        </button>
      </div>

      {loadError ? <div className="admin-system-alert">{loadError}</div> : null}
      {actionError ? <div className="admin-system-alert">{actionError}</div> : null}

      {isLoading ? (
        <div className="admin-empty-state">Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="admin-empty-state">
          {loadError || "No teachers have been added yet."}
        </div>
      ) : (
        <div className="admin-grid">
          {teachers.map((teacher) => (
            <article className="admin-item-card" key={teacher._id}>
              {teacher.imageUrl ? (
                <div className="admin-item-image">
                  <img src={teacher.imageUrl} alt={teacher.name} />
                </div>
              ) : (
                <div className="admin-teacher-placeholder">
                  <span>{teacher.name ? teacher.name.charAt(0) : "T"}</span>
                </div>
              )}

              <div className="admin-item-body">
                <div className="admin-item-top">
                  <h3>{teacher.name}</h3>
                </div>

                <p>{teacher.role}</p>

                <p>{teacher.bio}</p>

                <div className="admin-actions">
                  <button onClick={() => openEditForm(teacher)}>Edit</button>

                  <button
                    className="danger"
                    onClick={() => deleteTeacher(teacher._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingTeacher && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2>{mode === "add" ? "Add Teacher" : "Edit Teacher"}</h2>

            <label>Name</label>
            <input
              value={editingTeacher.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <label>Role</label>
            <input
              value={editingTeacher.role}
              onChange={(e) => handleChange("role", e.target.value)}
            />

            <label>Teacher Photo</label>
            <div className="admin-upload-box">
              {editingTeacher.imageUrl ? (
                <img src={editingTeacher.imageUrl} alt="Teacher preview" />
              ) : (
                <p>No image selected</p>
              )}

              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            <label>Bio</label>
            <textarea
              value={editingTeacher.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />

            <div className="admin-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
