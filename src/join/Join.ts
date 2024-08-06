import { delimiter, makeXt, parseXml, parseXt } from './packet/Packet'
import { InvalidJoinError } from '../errors/Errors'
import { validateName } from '../user/Validation'

import { Element } from 'elementtree'
import net from 'net'

const joinServer = net.createServer((socket) => {
    console.log('TCP client connected')

    socket.setEncoding('utf8')

    socket.on('data', (data: string) => onData(data, socket))
})

joinServer.listen(6113, () => {
    console.log('Join server listening on port 6113')
})

function onData(data: string, socket: net.Socket) {
    try {
        const packets = data.split(delimiter).filter(Boolean)

        for (const packet of packets) {
            if (packet.startsWith('<')) {
                handleXml(packet, socket)
            }

            if (packet.startsWith('%')) {
                handleXt(packet, socket)
            }
        }

    } catch (error) {
        console.log(error)
    }
}

function handleXml(data: string, socket: net.Socket) {
    const parsed = parseXml(data)

    if (!parsed) {
        return
    }

    switch (parsed.tag) {
        case 'policy-file-request':
            write(socket, '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>')
            break

        case 'msg':
            handleXmlMsg(parsed, socket)
            break
    }
}

function handleXmlMsg(parsed: Element, socket: net.Socket) {
    const body = parsed.find('body')

    if (!body) {
        return
    }

    const action = body.get('action')

    if (!action) {
        return
    }

    switch (action) {
        case 'verChk':
            write(socket, '<msg t="sys"><body action="apiOK" r="0"></body></msg>')
            break

        case 'login':
            write(socket, '<msg t="sys"><body action="logOK" r="0"></body></msg>')
            break
    }
}

function handleXt(data: string, socket: net.Socket) {
    const parsed = parseXt(data)

    if (!parsed) {
        return
    }

    switch (parsed.action) {
        case 'checkName':
            checkName(socket, parsed.args[0] as string)
            break
    }
}

async function checkName(socket: net.Socket, name: string) {
    try {
        name = await validateName(name)

        write(socket, makeXt('checkName', 0, name))

    } catch (error) {
        if (!(error instanceof InvalidJoinError)) {
            console.log(error)
        }

        write(socket, makeXt('checkName', 1, name))
    }
}

function write(socket: net.Socket, data: string) {
    socket.write(`${data}${delimiter}`)
}
