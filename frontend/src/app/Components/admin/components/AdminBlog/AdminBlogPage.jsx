"use client";

import { useEffect, useState, useContext, useRef } from "react";
import { useBlog } from "@/app/hooks/useBlog";
import { AuthContext } from "@/app/context/AuthContext";
import {
  BookOpen, Trash2, Edit2, Plus, X, Search,
  Clock, Tag, ChevronRight, Loader2, AlertCircle,
  Eye, Heart, MessageCircle, Star, Globe, FileText,
  Archive, CheckCircle, Hash, Sparkles, Upload, RotateCcw,
} from "lucide-react";

const Input = ({ label, required, hint, ...props }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-400 transition"
    />
  </div>
);

const Textarea = ({ label, required, hint, rows = 4, ...props }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    <textarea
      rows={rows}
      {...props}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-400 transition resize-none"
    />
  </div>
);

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: <FileText className="w-3.5 h-3.5" />,
    class: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  published: {
    label: "Published",
    icon: <Globe className="w-3.5 h-3.5" />,
    class: "bg-green-50 text-green-600 border-green-200",
  },
  archived: {
    label: "Archived",
    icon: <Archive className="w-3.5 h-3.5" />,
    class: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const EMPTY_FORM = {
  title: "",
  content: "",
  excerpt: "",
  featuredImage: "",
  imageUrl: "",
  tags: "",
  status: "draft",
  isFeatured: false,
  seo: { metaTitle: "", metaDescription: "", keywords: "" },
};

const normalizeBlogs = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.blogs)) return res.blogs;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.result)) return res.result;
  return [];
};

export default function AdminBlogPage() {
  const { UserAuthData } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const {
    loading,
    error,
    handleCreateBlog,
    handleGetPlatformBlogs,
    handleUpdateBlog,
    handleDeleteBlog,
  } = useBlog();

  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [view, setView] = useState("list");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [imageMode, setImageMode] = useState("upload");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const fetchBlogs = async () => {
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (search) params.search = search;
      const res = await handleGetPlatformBlogs(params);
      setBlogs(normalizeBlogs(res));
    } catch (_) {
      setBlogs([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filterStatus]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setSeoField = (field, value) =>
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));

  const clearImage = () => {
    setPreviewUrl("");
    setImageFile(null);
    setForm((prev) => ({ ...prev, featuredImage: "", imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setForm((prev) => ({ ...prev, featuredImage: "", imageUrl: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, featuredImage: "", imageUrl: "" }));
  };

  const openCreate = () => {
    setEditingBlog(null);
    setForm(EMPTY_FORM);
    setPreviewUrl("");
    setImageFile(null);
    setImageMode("upload");
    setView("form");
  };

  const openEdit = (blog) => {
    setEditingBlog(blog);
    const img = blog.featuredImage || "";
    setPreviewUrl(img);
    setImageFile(null);
    setImageMode(img ? "url" : "upload");
    setForm({
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      featuredImage: img,
      imageUrl: img,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      status: blog.status || "draft",
      isFeatured: blog.isFeatured || false,
      seo: {
        metaTitle: blog.seo?.metaTitle || "",
        metaDescription: blog.seo?.metaDescription || "",
        keywords: Array.isArray(blog.seo?.keywords)
          ? blog.seo.keywords.join(", ")
          : blog.seo?.keywords || "",
      },
    });
    setView("form");
  };

  const openDetail = (blog) => {
    setSelectedBlog(blog);
    setView("detail");
  };

const handleSubmit = async (e) => {
  e.preventDefault()

  let image = ''

  if (imageMode === 'upload' && imageFile) {
    const reader = new FileReader()
    image = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(imageFile)
    })
  } else if (imageMode === 'url') {
    image = form.imageUrl.trim()
  }

  const payload = {
    type: 'platform',
    image,
    title: form.title.trim(),
    content: form.content.trim(),
    excerpt: form.excerpt.trim(),
    status: form.status,
    isFeatured: form.isFeatured,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    seo: {
      metaTitle: form.seo.metaTitle.trim(),
      metaDescription: form.seo.metaDescription.trim(),
      keywords: form.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    },
  }

  try {
    if (editingBlog) {
      await handleUpdateBlog(editingBlog._id, payload)
      showSuccess('Blog updated successfully!')
    } else {
      await handleCreateBlog(payload)
      showSuccess('Blog published successfully!')
    }
    await fetchBlogs()
    setView('list')
  } catch (_) {}
}


  const handleDelete = async (id) => {
    try {
      await handleDeleteBlog(id);
      setDeleteConfirmId(null);
      showSuccess("Blog deleted.");
      if (view === "detail") setView("list");
      await fetchBlogs();
    } catch (_) {}
  };

  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  const filtered = safeBlogs.filter((b) => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.title?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  if (deleteConfirmId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-gray-800 font-semibold text-lg">Delete Blog?</h3>
          </div>
          <p className="text-gray-500 text-sm mb-5">
            This action cannot be undone. The blog will be permanently removed from the platform.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView("list")}
              className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                {editingBlog ? (
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Plus className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingBlog ? "Update Platform Blog" : "Create Platform Blog"}
                </h2>
                <p className="text-xs text-gray-400">
                  This blog will be published under the platform (type: platform)
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blog Content</p>
              <Input
                label="Title"
                required
                hint={`${form.title.length}/200`}
                type="text"
                maxLength={200}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Enter a compelling blog title..."
              />
              <Textarea
                label="Excerpt"
                hint={`${form.excerpt.length}/500`}
                rows={2}
                maxLength={500}
                value={form.excerpt}
                onChange={(e) => setField("excerpt", e.target.value)}
                placeholder="Short summary shown in blog listing..."
              />
              <Textarea
                label="Content"
                required
                rows={10}
                value={form.content}
                onChange={(e) => setField("content", e.target.value)}
                placeholder="Write your full blog content here..."
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Media & Tags</p>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Featured Image</label>
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setImageMode("upload"); clearImage(); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        imageMode === "upload"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageMode("url"); clearImage(); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        imageMode === "url"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Globe className="w-3 h-3" /> URL
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <>
                    {previewUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 bg-slate-50">
                        <img src={previewUrl} alt="preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-indigo-600 text-xs font-bold rounded-xl shadow transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Change
                          </button>
                          <button
                            type="button"
                            onClick={clearImage}
                            className="w-7 h-7 bg-white/90 hover:bg-white text-rose-500 rounded-xl flex items-center justify-center shadow transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="w-full h-44 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center transition-colors">
                          <Upload className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP, GIF · Max 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, imageUrl: e.target.value }));
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                    {previewUrl && (
                      <div className="relative mt-2 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white text-rose-500 rounded-lg flex items-center justify-center shadow text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Input
                label="Tags"
                hint="comma separated"
                type="text"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                placeholder="e.g. health, nutrition, wellness"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-2">
                  {form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setField("status", key)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition ${
                        form.status === key
                          ? cfg.class
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Featured Blog</p>
                    <p className="text-xs text-gray-400">Highlight on platform homepage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setField("isFeatured", !form.isFeatured)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isFeatured ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isFeatured ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-600 font-medium">
                  This blog will be posted as a <span className="font-bold">Platform</span> blog (type: platform) visible to all users.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO Settings</p>
              <Input
                label="Meta Title"
                type="text"
                value={form.seo.metaTitle}
                onChange={(e) => setSeoField("metaTitle", e.target.value)}
                placeholder="SEO title (defaults to blog title if empty)"
              />
              <Textarea
                label="Meta Description"
                hint={`${form.seo.metaDescription.length}/160`}
                rows={2}
                maxLength={160}
                value={form.seo.metaDescription}
                onChange={(e) => setSeoField("metaDescription", e.target.value)}
                placeholder="Brief description for search engines..."
              />
              <Input
                label="Keywords"
                hint="comma separated"
                type="text"
                value={form.seo.keywords}
                onChange={(e) => setSeoField("keywords", e.target.value)}
                placeholder="e.g. platform blog, health news"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {typeof error === "string" ? error : error?.message || "Something went wrong"}
              </div>
            )}

            <div className="flex gap-3 pb-6">
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingBlog ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {loading ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedBlog) {
    const status = STATUS_CONFIG[selectedBlog?.status] || STATUS_CONFIG.draft;
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-4 h-4" /> Back to Blogs
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(selectedBlog)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setDeleteConfirmId(selectedBlog._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {selectedBlog?.featuredImage && (
              <div className="h-56 overflow-hidden">
                <img
                  src={selectedBlog.featuredImage}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.class}`}>
                  {status.icon} {status.label}
                </span>
                {selectedBlog?.isFeatured && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                    <Star className="w-3.5 h-3.5" /> Featured
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5" /> Platform Blog
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">{selectedBlog?.title}</h1>
              {selectedBlog?.excerpt && (
                <p className="text-gray-500 text-sm mb-4 italic border-l-4 border-indigo-200 pl-3">
                  {selectedBlog.excerpt}
                </p>
              )}
              <div className="flex items-center gap-5 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(selectedBlog?.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {selectedBlog?.views ?? 0} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  {selectedBlog?.likes ?? 0} likes
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {selectedBlog?.commentsCount ?? 0} comments
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedBlog?.content}
              </p>
              {Array.isArray(selectedBlog?.tags) && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                  {selectedBlog.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                      <Hash className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(selectedBlog?.seo?.metaTitle || selectedBlog?.seo?.metaDescription) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    SEO Preview
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-indigo-600 text-sm font-medium mb-1">
                      {selectedBlog.seo.metaTitle || selectedBlog.title}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {selectedBlog.seo.metaDescription}
                    </p>
                    {Array.isArray(selectedBlog.seo?.keywords) && selectedBlog.seo.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedBlog.seo.keywords.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-400 rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Platform Blogs</h1>
            <p className="text-gray-400 text-sm">
              {safeBlogs.length} total article{safeBlogs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> New Blog
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",     value: safeBlogs.length,                                          color: "text-indigo-600" },
          { label: "Published", value: safeBlogs.filter((b) => b.status === "published").length,  color: "text-green-600"  },
          { label: "Drafts",    value: safeBlogs.filter((b) => b.status === "draft").length,      color: "text-yellow-600" },
          { label: "Featured",  value: safeBlogs.filter((b) => b.isFeatured).length,              color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, excerpt or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchBlogs()}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition border ${
                filterStatus === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((blog) => {
            const status = STATUS_CONFIG[blog.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={blog._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group overflow-hidden"
              >
                <div className="flex">
                  {blog.featuredImage ? (
                    <div className="w-28 shrink-0 hidden sm:block overflow-hidden">
                      <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-28 shrink-0 hidden sm:flex items-center justify-center bg-gray-50 border-r border-gray-100">
                      <BookOpen className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 p-5 flex items-start gap-3 min-w-0">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(blog)}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${status.class}`}>
                          {status.icon} {status.label}
                        </span>
                        {blog.isFeatured && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                        )}
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100">
                          <Sparkles className="w-3 h-3" /> Platform
                        </span>
                      </div>
                      <h3 className="text-gray-800 font-semibold text-base truncate mb-1 group-hover:text-indigo-600 transition">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-400 text-sm line-clamp-1 mb-2">{blog.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {blog.views ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {blog.likes ?? 0}
                        </span>
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {blog.tags.slice(0, 2).join(", ")}
                            {blog.tags.length > 2 && ` +${blog.tags.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => openDetail(blog)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(blog)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(blog._id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-indigo-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">No platform blogs found</h3>
          <p className="text-gray-400 text-sm mb-5">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Start creating platform blogs to engage your users"}
          </p>
          {!search && filterStatus === "all" && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Create First Blog
            </button>
          )}
        </div>
      )}
    </div>
  );
}
