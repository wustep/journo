import { randomUUID } from "crypto"

export function randID() {
	return randomUUID().replace(/-/g, "")
}

export function randIDWithDashes() {
	return randomUUID()
}

export function withoutDashes(id: string) {
	return id.replace(/-/g, "")
}
