let io

export const initSocket = (server) => {
    io = server
}

export const getSocket = () => io
