document.addEventListener("DOMContentLoaded", function () {
  const lightIcon = "fa-sun"; // 亮色模式图标
  const darkIcon = "fa-moon"; // 暗色模式图标

  let isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches; // 检查是否为暗色模式

  const siteNav = document.querySelector("nav.site-nav"); // 获取导航栏
  const icon = document.createElement("i"); // 创建图标元素
  icon.classList.add("fas");
  const span = document.createElement("span"); // 创建文本元素
  span.innerHTML = "切换深色模式"; // 设置文本为中文
  const link = document.createElement("a"); // 创建链接元素
  link.classList.add("nav-list-link");
  link.append(icon, span);
  link.setAttribute("href", "#");
  const li = document.createElement("li"); // 创建列表项
  li.classList.add("nav-list-item");
  li.append(link);
  const ul = document.createElement("ul"); // 创建列表
  ul.classList.add("nav-list", "nav-list-site-settings");
  ul.append(li);
  siteNav.append(ul);

  function update() {
    if (isDark) {
      jtd.setTheme("dark"); // 设置为深色主题
      icon.classList.remove(darkIcon);
      icon.classList.add(lightIcon);
    } else {
      jtd.setTheme("light"); // 设置为浅色主题
      icon.classList.remove(lightIcon);
      icon.classList.add(darkIcon);
    }
  }

  update();

  function toggle() {
    isDark = !isDark; // 切换模式
    update();
  }

  jtd.addEvent(link, "click", function (event) {
    event.preventDefault();
    toggle();
  });
});
