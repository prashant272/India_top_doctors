class PeerService {
    constructor() {
        this.peer = null;
    }

    initPeer(onIceCandidate, onTrack) {
        if (this.peer) {
            this.peer.close();
            this.peer = null;
        }

        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        });

        this.peer.onicecandidate = (e) => {
            if (e.candidate) onIceCandidate(e.candidate);
        };

        this.peer.ontrack = (e) => {
            if (e.streams && e.streams[0]) onTrack(e.streams[0]);
        };
    }

    async getOffer() {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async getAnswer(offer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(ans);
        return ans;
    }

    async setRemoteDescription(ans) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }

    async addIceCandidate(candidate) {
        if (this.peer && candidate) {
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("ICE candidate error", e);
            }
        }
    }

    destroyPeer() {
        if (this.peer) {
            this.peer.close();
            this.peer = null;
        }
    }
}

const peer = new PeerService();
export default peer;
