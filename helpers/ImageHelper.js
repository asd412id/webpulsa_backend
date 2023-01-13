class ImageHelper {
  imgTags(html) {
    return html?.match(/<img [^>]*src="[^"]*"[^>]*>/gm) ?? [];
  };

  imgSrcs(html) {
    return html?.match(/<img [^>]*src="[^"]*"[^>]*>/gm)?.map(x => x.replace(/.*src="([^"]*)".*/, '$1')) ?? [];
  }

  getBuffer(base64Data) {
    return base64Data?.replace(/^data:image\/[a-z]+;base64,/, "");
  }

  base64Extension(base64Data) {
    return base64Data?.split(';')[0].split('/')[1] ?? null;
  };
}

module.exports = new ImageHelper;