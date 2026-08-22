const KEY = "ic_anon_id";

export function getAnonId() {
    try {
        let id = localStorage.getItem(KEY);
        if (!id) {
            id = "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem(KEY, id);
        }
        return id;
    } catch {
        return "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
}