"use client";

import { useEffect, useState, useContext } from "react";
import { useBlog } from "@/app/hooks/useBlog";
import { AuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  BookOpen, Trash2, Edit2, Plus, X, Search,
  Clock, Tag, ChevronRight, Loader2, AlertCircle,
  Eye, Heart, MessageCircle, Star, Globe, FileText,
  Archive, CheckCircle, Hash, Lock, Sparkles,
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
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-400 transition"
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
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-400 transition resize-none"
    />
  </div>
);

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon:  <FileText className="w-3.5 h-3.5" />,
    class: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  published: {
    label: "Published",
    icon:  <Globe className="w-3.5 h-3.5" />,
    class: "bg-green-50 text-green-600 border-green-200",
  },
  archived: {
    label: "Archived",
    icon:  <Archive className="w-3.5 h-3.5" />,
    class: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const EMPTY_FORM = {
  title:         "",
  content:       "",
  excerpt:       "",
  featuredImage: "",
  tags:          "",
  status:        "draft",
  isFeatured:    false,
  seo: { metaTitle: "", metaDescription: "", keywords: "" },
};

const normalizeBlogs = (res) => {
  if (!res) return [];
  if (Array.isArray(res))         return res;
  if (Array.isArray(res.blogs))   return res.blogs;
  if (Array.isArray(res.data))    return res.data;
  if (Array.isArray(res.result))  return res.result;
  return [];
};

export default function BlogPage() {
  const { UserAuthData } = useContext(AuthContext);
  const router    = useRouter();
  const doctorId  = UserAuthData?.userId;

  const hasBlogAccess = (() => {
    if (!UserAuthData)                   return false;
    if (!UserAuthData.isActive)          return false;
    if (!UserAuthData.isPremium)         return false;
    if (!UserAuthData.planExpiryDate)    return false;
    return new Date(UserAuthData.planExpiryDate) > new Date();
  })();

  const accessDeniedReason = (() => {
    if (!UserAuthData || !UserAuthData.isPremium) return "no_plan";
    if (!UserAuthData.planExpiryDate)              return "no_plan";
    if (new Date(UserAuthData.planExpiryDate) <= new Date()) return "expired";
    if (!UserAuthData.isActive)                    return "inactive";
    return null;
  })();

  const {
    loading,
    error,
    handleCreateBlog,
    handleGetDoctorBlogs,
    handleUpdateBlog,
    handleDeleteBlog,
  } = useBlog();

  const [blogs, setBlogs]                 = useState([]);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [view, setView]                   = useState("list");
  const [selectedBlog, setSelectedBlog]   = useState(null);
  const [editingBlog, setEditingBlog]     = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [successMsg, setSuccessMsg]       = useState("");

  const fetchBlogs = async () => {
    if (!doctorId) return;
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (search)                 params.search = search;
      const res = await handleGetDoctorBlogs(doctorId, params);
      setBlogs(normalizeBlogs(res));
    } catch (_) {
      setBlogs([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [doctorId, filterStatus]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const setField    = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setSeoField = (field, value) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));

  const openCreate = () => {
    if (!hasBlogAccess) return;
    if (!doctorId) { alert("Please log in first."); return; }
    setEditingBlog(null);
    setForm(EMPTY_FORM);
    setView("form");
  };

  const openEdit = (blog) => {
    if (!hasBlogAccess) return;
    setEditingBlog(blog);
    setForm({
      title:         blog.title         || "",
      content:       blog.content       || "",
      excerpt:       blog.excerpt       || "",
      featuredImage: blog.featuredImage || "",
      tags:          Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      status:        blog.status        || "draft",
      isFeatured:    blog.isFeatured    || false,
      seo: {
        metaTitle:       blog.seo?.metaTitle       || "",
        metaDescription: blog.seo?.metaDescription || "",
        keywords:        Array.isArray(blog.seo?.keywords)
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
    e.preventDefault();
    if (!hasBlogAccess) return;
    if (!doctorId) { alert("Session expired. Please log in again."); return; }

    const payload = {
      type:          "doctor",
      title:         form.title.trim(),
      content:       form.content.trim(),
      excerpt:       form.excerpt.trim(),
      featuredImage: form.featuredImage.trim(),
      status:        form.status,
      isFeatured:    form.isFeatured,
      doctor:        doctorId,
      tags:          form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seo: {
        metaTitle:       form.seo.metaTitle.trim(),
        metaDescription: form.seo.metaDescription.trim(),
        keywords:        form.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
    };

    try {
      if (editingBlog) {
        await handleUpdateBlog(editingBlog._id, payload);
        showSuccess("Blog updated successfully!");
      } else {
        await handleCreateBlog(payload);
        showSuccess("Blog created successfully!");
      }
      await fetchBlogs();
      setView("list");
    } catch (_) {}
  };

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
      b.title?.toLowerCase().includes(q)  ||
      b.excerpt?.toLowerCase().includes(q) ||
      (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "—";

  const AccessBanner = () => {
    if (hasBlogAccess) return null;
    const isExpired = accessDeniedReason === "expired";
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm mb-5">
        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          {isExpired
            ? "Your plan has expired. You can view and delete your existing blogs, but creating or editing requires an active plan."
            : "Blog access requires a Premium plan. You can view and delete your existing blogs."}
          {" "}
          <button
            onClick={() => router.push("/doctor/plans")}
            className="underline font-medium hover:text-orange-900"
          >
            {isExpired ? "Renew now" : "Upgrade now"}
          </button>
        </span>
      </div>
    );
  };

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
            This action cannot be undone. The blog will be permanently removed.
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
    if (!hasBlogAccess) {
      setView("list");
      return null;
    }
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
              <div className="p-2 bg-blue-100 rounded-lg">
                {editingBlog ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingBlog ? "Update Blog" : "Create New Blog"}
                </h2>
                <p className="text-xs text-gray-400">
                  Fill in the required fields to {editingBlog ? "update" : "publish"} your blog
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
              <Input
                label="Featured Image URL"
                type="text"
                value={form.featuredImage}
                onChange={(e) => setField("featuredImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {form.featuredImage && (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-44">
                  <img
                    src={form.featuredImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
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
                  {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                      <Hash className="w-3 h-3" /> {tag}
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
                        form.status === key ? cfg.class : "border-gray-200 text-gray-400 hover:border-gray-300"
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
                    <p className="text-xs text-gray-400">Highlight on homepage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setField("isFeatured", !form.isFeatured)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFeatured ? "translate-x-5" : "translate-x-0"}`} />
                </button>
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
                placeholder="e.g. doctor blog, health tips"
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
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
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
              {hasBlogAccess ? (
                <button
                  onClick={() => openEdit(selectedBlog)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" /> Edit Locked
                </span>
              )}
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
                <img src={selectedBlog.featuredImage} alt={selectedBlog.title} className="w-full h-full object-cover" />
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
                {!hasBlogAccess && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
                    <Lock className="w-3.5 h-3.5" /> Read Only
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">{selectedBlog?.title}</h1>
              {selectedBlog?.excerpt && (
                <p className="text-gray-500 text-sm mb-4 italic border-l-4 border-blue-200 pl-3">
                  {selectedBlog.excerpt}
                </p>
              )}
              <div className="flex items-center gap-5 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100 flex-wrap">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDate(selectedBlog?.createdAt)}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{selectedBlog?.views ?? 0} views</span>
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />{selectedBlog?.likes ?? 0} likes</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{selectedBlog?.commentsCount ?? 0} comments</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedBlog?.content}</p>
              {Array.isArray(selectedBlog?.tags) && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                  {selectedBlog.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                      <Hash className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
              {(selectedBlog?.seo?.metaTitle || selectedBlog?.seo?.metaDescription) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SEO Preview</p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-blue-600 text-sm font-medium mb-1">
                      {selectedBlog.seo.metaTitle || selectedBlog.title}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">{selectedBlog.seo.metaDescription}</p>
                    {Array.isArray(selectedBlog.seo?.keywords) && selectedBlog.seo.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedBlog.seo.keywords.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-400 rounded-md">{kw}</span>
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
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
            <p className="text-gray-400 text-sm">
              {safeBlogs.length} total article{safeBlogs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {hasBlogAccess ? (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> New Blog
          </button>
        ) : (
          <button
            onClick={() => router.push("/doctor/plans")}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition"
          >
            <Sparkles className="w-4 h-4" />
            {accessDeniedReason === "expired" ? "Renew Plan" : "Upgrade to Create"}
          </button>
        )}
      </div>

      {!hasBlogAccess && <AccessBanner />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",     value: safeBlogs.length,                                         color: "text-blue-600"   },
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition border ${
                filterStatus === s
                  ? "bg-blue-600 text-white border-blue-600"
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
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group overflow-hidden"
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
                        {blog.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />}
                      </div>
                      <h3 className="text-gray-800 font-semibold text-base truncate mb-1 group-hover:text-blue-600 transition">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-400 text-sm line-clamp-1 mb-2">{blog.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(blog.createdAt)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views ?? 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blog.likes ?? 0}</span>
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
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {hasBlogAccess ? (
                        <button
                          onClick={() => openEdit(blog)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button disabled className="p-2 rounded-lg text-gray-200 cursor-not-allowed" title="Upgrade plan to edit">
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
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
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">No blogs found</h3>
          <p className="text-gray-400 text-sm mb-5">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : hasBlogAccess
              ? "Start writing to share your medical insights"
              : "You have no blogs yet. Upgrade your plan to start writing."}
          </p>
          {!search && filterStatus === "all" && hasBlogAccess && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Write First Blog
            </button>
          )}
          {!search && filterStatus === "all" && !hasBlogAccess && (
            <button
              onClick={() => router.push("/doctor/plans")}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition"
            >
              <Sparkles className="w-4 h-4" />
              {accessDeniedReason === "expired" ? "Renew Plan" : "Upgrade Plan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
