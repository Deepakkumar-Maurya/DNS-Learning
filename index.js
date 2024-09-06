import dgram from "dgram";
import dnsPacket from "dns-packet";

const server = dgram.createSocket("udp4");

const db = {
    'deepak.com': '1.2.3.4',
    'google.com': '8.8.8.8',
    'cloudflare.com': '1.1.1.1',
}

server.on("message", (msg, rinfo) => {
    const incomingReq = dnsPacket.decode(msg);
    const ipFromDB = db[incomingReq.questions[0].name];

    // console.log(ipFromDB)
    const ans = dnsPacket.encode({
        type: 'response',
        id: incomingReq.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingReq.questions,
        answers: [
            {
                name: incomingReq.questions[0].name,
                type: 'A',
                class: 'IN',
                // ttl: 60,
                data: ipFromDB
            }
        ]
    })

    server.send(ans, rinfo.port, rinfo.address);

    console.log({
        ans: ans.toString(),
        packet: incomingReq.questions,
        message: msg.toString(),
        rinfo: rinfo
    })
});

// ** default port for dns is 53
server.bind(53, () => {
    console.log("DNS Server listening on 53");
})  