const db = require('../storage/database');

function enqueue(message) {

    const stmt = db.prepare(
        `INSERT OR IGNORE INTO messages (
            message_id,
            type,
            payload,
            status
        )
        VALUES(?,?,?,'PENDING')
    `);

    const result = stmt.run(
        message.message_id,
        message.type,
        JSON.stringify(message.payload)
    );

    return result;
}

function getPendingMessages(limit = 10){
    return db.prepare(`
        SELECT *
        FROM messages
        WHERE status = 'PENDING'
        ORDER BY id ASC
        LIMIT ?
        `).all(limit);
}


function markSend(id){
    return db.prepare(`
        UPDATE messages
        SET
            status = 'SENT'
            sent_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `).run(id);
}

function markError(id, error) {
    return db.prepare(`
        UPDATE messages
        SET
            status = 'PENDING',
            attempts = attempts + 1,
            last_error = ?
        WHERE id = ?
        `).run(id, error);
}

module.exports = {
    enqueue,
    getPendingMessages,
    markSend,
    markError
}