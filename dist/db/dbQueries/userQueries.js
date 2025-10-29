export const UserQueries = {
    findById: "SELECT * FROM users WHERE id = ?",
    findByEmail: "SELECT * FROM users WHERE email = ?",
    create: "INSERT INTO users (first_name, last_name, email, role) VALUES (?, ?, ?, ?)",
    delete: "DELETE FROM users WHERE id = ?"
};
//# sourceMappingURL=userQueries.js.map