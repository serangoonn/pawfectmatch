import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator, ChannelList, useChatContext } from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'
import { Buffer } from 'buffer' 

const bufferData = Buffer.from('anything','base64')

if (typeof global.Buffer === 'undefined') {
    global.Buffer = require('buffer').Buffer;
}

const user = {
    id: 'bruno',
    name: 'Bruno',
}

const filters = { type: 'messaging', members: { $in: [user.id] } }
const sort = { last_message_at: -1 }

function CustomChannelPreview(props) {
    const { channel, setActiveChannel } = props
    const { messages } = channel.state
    const lastMessage = messages[messages.length - 1]

    return (
        <button
            onClick={() => setActiveChannel(channel)}
            style={{ margin: '12px' }}
        >
            <div>{channel.data.name || 'Unnamed Channel'}</div>
            <div style={{ fontSize: '14px' }}>
                {lastMessage ? lastMessage.text : 'No messages yet'}
            </div>
        </button>
    )
}

function CustomChannelHeader() {
    const {channel} = useChatContext()
    const {data} = channel
    return (
        <header
            style={{
                height: '40px',
                backgroundColor: 'white',
                marginBottom: '20px',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {data.image && (
                <img
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        marginRight: 10,
                    }}
                    src={data.image}
                    alt=""
                />
            )}
            {data.name}     
        </header>
    )
}

export default function Chatty() {
    const [client, setClient] = useState(null)
    const [channel, setChannel] = useState(null)

    useEffect(() => {
        async function init() {
            const chatClient = StreamChat.getInstance("6zz45v7bp8k7")
            await chatClient.connectUser(user, chatClient.devToken(user.id))

            const channel = chatClient.channel('messaging', 'react-group', {
                image: 'https://www.drupal.org/files/project-images/react.png',
                name: 'Chat',
                members: [user.id],
            })

            await channel.watch()

            setChannel(channel)
            setClient(chatClient)
        }

        init()

        if (client) return () => client.disconnectUser()

    }, [])

    if (!channel || !client) return <LoadingIndicator />

    return (
        <Chat client={client} theme="messaging light">
            <ChannelList 
                filters={filters}
                sort={sort}
                Preview={CustomChannelPreview}
            />
            <Channel>
                <Window>
                    <CustomChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
        </Chat>
    )
}
