FROM node:alpine


LABEL description="Create the musician UDP server mimics the musician who plays \
an music instrument in a orchestra \
You can change the port expose by the musician as you want to communicate with the auditor or over client.\
The default smtp port is 2205."
LABEL authors="Iando Rafidimalala"
LABEL version="1.0"


#
# Replace the directory with your own directory that stands the source file
# example /tmp/dockerMusic/musician/src
#
ENV DIRECTORY /tmp/dockerMusic/musician/

ADD src DIRECTORY


WORKDIR DIRECTORY

RUN npm install --save

#The container listen in this specific ports
#The port 2205/tcp is used to musician server
EXPOSE 2205 

#The default argument for the ENTREPOINT
#The argument "-p 2525" stand for the port the musician broadcast his performance

ENTRYPOINT ["node","musician.js"]
