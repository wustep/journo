import { randomUUID } from "crypto"

export function randId() {
	return randomUUID().replace(/-/g, "")
}

export function randIdWithDashes() {
	return randomUUID()
}

export function withoutDashes(id: string) {
	return id.replace(/-/g, "")
}
