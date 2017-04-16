var deepEqual = require('deep-equal');

class JarInfo {

    constructor() {
        this.id = null;
        this.filenames = [];
        this.urls = [];
        this.poms = [];
        this.osgiready = null;
    }

    addFilename(filename) {
        if (!this.filenames.includes(filename)) {
            this.filenames.push(filename);
            this.filenames.sort();
        }
    }

    addURL(url) {
        if (!this.urls.includes(url)) {
            this.urls.push(url);
            this.urls.sort();
        }
    }

    addPOM(pom) {
        if (pom && !this.hasPOM(pom)) {
            this.poms.push(pom);
            this.poms.sort((p1,p2)=>p1.compare(p2));
        }
    }
    
    hasPOM(pom) {
        if (!pom) {
            return false;
        }

        return this.poms.some((item) => item.compare(pom) === 0);
    }

    equals(jarInfo) {
        return deepEqual(this, jarInfo);
    }

    merge(jarInfo) {
        if (this.osgiready === null) {
            this.osgiready = jarInfo.osgiready;
        }

        jarInfo.filenames.forEach((fn)=>this.addFilename(fn));
        jarInfo.urls.forEach((url)=>this.addURL(url));
        jarInfo.poms.forEach((pom)=>this.addPOM(pom));
    }
}

var pomKey = (pom) => {
    return this.groupId+' '+this.artifactId+' '+this.version;
};

class POM {

    constructor(groupId, artifactId, version) {
        this.groupId = groupId;
        this.artifactId = artifactId;
        this.version = version;
    }
    
    key() {
        return pomKey(this);
    }

    compare(pom) {
        if (this.key() < pomKey(pom)) {
            return -1;
        }

        if (this.key() > pomKey(pom)) {
            return 1;
        }

        return 0;
    }   
}

exports.JarInfo = JarInfo;
exports.POM = POM;