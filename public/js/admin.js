const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

$(".onchange").on("change", function () {
  $("#preview").addClass("show");
  $("#preview").removeClass("hide");
  $("#create").removeClass("show");
  $("#create").addClass("hide");
  $("#msg").text("");
  $("#create").attr("disabled", false);
});

$("#preview").on("click", async (e) => {
  const type = $("#type").val();
  const title = $("#title").val();
  const bannerImage = $("#banner_image")[0].files[0];
  const content = tinyMCE.get("content").getContent();

  if (!bannerImage) {
    return;
  }

  e.preventDefault();
  try {
    let banner = await toBase64(bannerImage);

    if (banner) {
      $("#bannerPreview").attr("src", banner);
      $("#contentPreview").html(content);
    }

    $("#preview").addClass("hide");
    $("#create").removeClass("hide");
    $("#create").addClass("show");
    $("#preview").removeClass("show");
  } catch (error) {
    console.log(error);
  }
});

$("#create").on("click", async (e) => {
  const bannerImage = $("#banner_image")[0].files[0];
  const content = tinyMCE.get("content").getContent();

  e.preventDefault();
  try {
    let data = {
      banner: await toBase64(bannerImage),
      type: $("#type").val(),
      title: $("#title").val(),
      author: $("#author").val(),
      content,
    };

    let result = await axios.post("/admin", data);
    console.log(result);
    if (result.data.status) {
      $("#msg").css({ color: "green" });
    } else {
      $("#msg").css({ color: "red" });
    }

    $("#msg").html(result.data.data);
    $("#create").attr("disabled", true);
  } catch (error) {
    $("#msg").css({ color: "red" });
    $("#msg").html(
      `There was a problem creating this ${$("#type").val()} post.`
    );
    console.log(error);
  }
});

// alert()
