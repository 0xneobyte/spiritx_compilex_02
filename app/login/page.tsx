console.log("Login response data:", {
  user: data.user,
  role: data.user.role,
  isAdminRole: data.user.role === "admin",
});

if (data.user.role === "admin") {
  console.log("Redirecting to admin dashboard");
  router.push("/admin/dashboard");
} else {
  console.log("Redirecting to user dashboard");
  router.push("/user/dashboard");
}
