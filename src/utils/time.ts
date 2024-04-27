export function getISODate() {
	return new Date().toISOString().split(" ")[0]
}
