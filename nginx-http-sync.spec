
%define use_systemd (0%{?fedora} && 0%{?fedora} >= 18) || (0%{?rhel} && 0%{?rhel} >= 7) || (0%{?suse_version} == 1315)


%if 0%{?rhel}  == 7
Group: System Environment/Daemons
Requires: systemd
BuildRequires: systemd
%endif

Name:     nginx-http-sync
Version:	1.0.0
Release:	1%{?dist}
Summary:	awesome project

Group:		Applications/System
License:	GPL-3.0
URL:		  http://awesomeprotject.io
Source0:	%{name}-%{version}.tar.gz

BuildRequires: npm git
Requires:	    nodejs

BuildRoot:  %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch:	noarch

%description
sync local dir with NGINX autoindex


%prep
%setup -q -n %{name}-%{version}


%build
npm install

%install
test "x$RPM_BUILD_ROOT" != "x" && rm -rf $RPM_BUILD_ROOT
mkdir -p %{buildroot}/%{_datadir}/%{name}

%if %{use_systemd}
%{__mkdir} -p %{buildroot}%{_unitdir}
cp nginx-sync.service %{buildroot}%{_unitdir}/nginx-sync.service
%endif



cp -av lib/ %{buildroot}/%{_datadir}/%{name}

cp index.js %{buildroot}/%{_datadir}/%{name}
cp package.json %{buildroot}/%{_datadir}/%{name}
cp service.js %{buildroot}/%{_datadir}/%{name}

mkdir -p %{buildroot}/%{_sysconfdir}/%{name}
install -Dp -m 644 config.js.editme %{buildroot}/%{_sysconfdir}/%{name}/config.js
ln -sf %{_sysconfdir}/%{name}/config.js %{buildroot}/%{_datadir}/%{name}/config.js


%clean
rm -rf %{buildroot}


%files
%defattr(644, root, root, 755)
%doc LICENSE.md README.md
%{_datadir}/%{name}
%dir %{_sysconfdir}/%{name}
%config(noreplace) %{_sysconfdir}/%{name}/config.js


%if %{use_systemd}
%{_unitdir}/nginx-sync.service
%endif

%post
# Register the netdata service
if [ $1 -eq 1 ]; then
%if %{use_systemd}
    /usr/bin/systemctl preset nginx-sync.service >/dev/null 2>&1 ||:
%endif
fi



%changelog
