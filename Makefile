SRC_DIR = jquery
BUILD_DIR = build

LIB = jquery.goomaps.js
LIBMIN = jquery.goomaps.min.js

FILES = ${SRC_DIR}/jquery.goomaps.js\
	${SRC_DIR}/jquery.goomaps.layers.js\
	${SRC_DIR}/jquery.goomaps.circles.js\
	${SRC_DIR}/jquery.goomaps.customcontrols.js

all: main

main:
	cat ${FILES} > ${BUILD_DIR}/${LIB}
	yui-compressor ${BUILD_DIR}/${LIB} -o ${BUILD_DIR}/${LIBMIN}

clean:
	rm -f ${BUILD_DIR}/${LIB} ${BUILD_DIR}/${LIBMIN}
